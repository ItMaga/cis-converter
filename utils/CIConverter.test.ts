import { describe, test, expect } from "vitest";
import CIConverter from "./CIConverter";

describe("CIConverter", () => {
  test("1.1 from GitHub Actions to GitLab CI", () => {
    const ci = {
      type: "github" as const,
      code: `
        on: [push]
        jobs:
            hello:
                runs-on: ubuntu-latest
                steps:
                    - run: echo "Hello World"
            `,
    };
    const converter = new CIConverter(ci, "gitlab");
    const result = converter.convert();
    expect(result).toBe(`stages:
  - hello
hello-job:
  stage: hello
  script:
    - echo "Hello World"\n`);
  });
  test("1.2 from GitLab CI to GitHub Actions", () => {
    const ci = {
      type: "gitlab" as const,
      code: `
        stages:
          - hello
        hello:
          stage: hello
          script:
            - echo "Hello World"
            `,
    };
    const converter = new CIConverter(ci, "github");
    const result = converter.convert();
    expect(result).toBe(`on:
  - push
jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello World"\n`);
  });

  test("2.1 from GitHub Actions to GitLab CI", () => {
    const ci = {
      type: "github" as const,
      code: `
      on: [push]
      jobs:
        build:
          runs-on: ubuntu-latest
          container: golang:alpine
          steps:
            - run: apk update
            - run: go build -o bin/hello
            - uses: actions/upload-artifact@v3
              with:
                name: hello
                path: bin/hello
                retention-days: 7
        deploy:
          if: contains( github.ref, 'staging')
          runs-on: ubuntu-latest
          container: golang:alpine
          steps:
            - uses: actions/download-artifact@v3
              with:
                name: hello
            - run: echo "Deploying to Staging"
            - run: scp bin/hello remoteuser@remotehost:/remote/directory      
      `,
    };

    const converter = new CIConverter(ci, "gitlab");
    const result = converter.convert();
    expect(result).toBe(`default:
  image: golang:alpine
stages:
  - build
  - deploy
build-job:
  stage: build
  script:
    - apk update
    - go build -o bin/hello
deploy-job:
  stage: deploy
  script:
    - echo "Deploying to Staging"
    - scp bin/hello remoteuser@remotehost:/remote/directory
  rules:
    - if: $CI_COMMIT_REF_NAME =~ /staging/\n`);
  });
});
