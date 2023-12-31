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
    expect(result).toBe(`stages:
  - build
  - deploy
build-job:
  image: golang:alpine
  stage: build
  script:
    - apk update
    - go build -o bin/hello
deploy-job:
  image: golang:alpine
  stage: deploy
  script:
    - echo "Deploying to Staging"
    - scp bin/hello remoteuser@remotehost:/remote/directory
  rules:
    - if: $CI_COMMIT_REF_NAME =~ /staging/\n`);
  });
  test("2.2 from GitLab CI to GitHub Actions", () => {
    const ci = {
      type: "gitlab" as const,
      code: `
      default:
        image: golang:alpine
      
      stages:
        - build
        - deploy
      
      build:
        stage: build
        script:
          - apk update
          - go build -o bin/hello
        artifacts:
          paths:
            - bin/hello
          expire_in: 1 week
      
      deploy:
        stage: deploy
        script:
          - echo "Deploying to Staging"
          - scp bin/hello remoteuser@remotehost:/remote/directory
        rules:
          - if: $CI_COMMIT_BRANCH == 'staging'
      `,
    };

    const converter = new CIConverter(ci, "github");
    const result = converter.convert();
    expect(result).toBe(`on:
  - push
jobs:
  build:
    runs-on: ubuntu-latest
    container: golang:alpine
    steps:
      - run: apk update
      - run: go build -o bin/hello
  deploy:
    if: contains(github.ref, 'staging')
    runs-on: ubuntu-latest
    container: golang:alpine
    steps:
      - run: echo "Deploying to Staging"
      - run: scp bin/hello remoteuser@remotehost:/remote/directory\n`);
  });

  test("3.1 from GitHub Actions to GitLab CI", () => {
    const ci = {
      type: "github" as const,
      code: `
      on: [push]
      jobs:
        python-version:
          runs-on: ubuntu-latest
          container: python:latest
          steps:
            - run: python --version
        java-version:
          if: contains( github.ref, 'staging')
          runs-on: ubuntu-latest
          container: openjdk:latest
          steps:
            - run: java -version
      `,
    };

    const converter = new CIConverter(ci, "gitlab");
    const result = converter.convert();
    expect(result).toBe(`stages:
  - python-version
  - java-version
python-version-job:
  image: python:latest
  stage: python-version
  script:
    - python --version
java-version-job:
  image: openjdk:latest
  stage: java-version
  script:
    - java -version
  rules:
    - if: $CI_COMMIT_REF_NAME =~ /staging/\n`);
  });
  test("3.2 from GitLab CI to GitHub Actions", () => {
    const ci = {
      type: "gitlab" as const,
      code: `
      stages:
        - python-version
        - java-version
      python-version:
        image: python:latest
        script:
          - python --version

      java-version:
        image: openjdk:latest
        rules:
          - if: $CI_COMMIT_BRANCH == 'staging'
        script:
          - java -version
    `,
    };

    const converter = new CIConverter(ci, "github");
    const result = converter.convert();
    expect(result).toBe(`on:
  - push
jobs:
  python-version:
    runs-on: ubuntu-latest
    container: python:latest
    steps:
      - run: python --version
  java-version:
    if: contains(github.ref, 'staging')
    runs-on: ubuntu-latest
    container: openjdk:latest
    steps:
      - run: java -version\n`);
  });

  test("GitHub Actions Matrix to GitLab CI", () => {
    const ci = {
      type: "github" as const,
      code: `
      on: [push]
      jobs:
        build:
          runs-on: ubuntu-latest
          steps:
            - run: echo "Building $PLATFORM for $ARCH"
          strategy:
            matrix:
              platform: [linux, mac, windows]
              arch: [x64, x86]
        test:
          runs-on: ubuntu-latest
          steps:
            - run: echo "Testing $PLATFORM for $ARCH"
          strategy:
            matrix:
              platform: [linux, mac, windows]
              arch: [x64, x86]
        deploy:
          runs-on: ubuntu-latest
          steps:
            - run: echo "Deploying $PLATFORM for $ARCH"
          strategy:
            matrix:
              platform: [linux, mac, windows]
              arch: [x64, x86]
      `,
    };

    const converter = new CIConverter(ci, "gitlab");
    const result = converter.convert();
    expect(result).toBe(`stages:
  - build
  - test
  - deploy
.parallel-hidden-job:
  parallel:
    matrix:
      PLATFORM:
        - linux
        - mac
        - windows
      ARCH:
        - x64
        - x86
build-job:
  extends: .parallel-hidden-job
  stage: build
  script:
    - echo "Building $PLATFORM for $ARCH"
test-job:
  extends: .parallel-hidden-job
  stage: test
  script:
    - echo "Testing $PLATFORM for $ARCH"
deploy-job:
  extends: .parallel-hidden-job
  stage: deploy
  script:
    - echo "Deploying $PLATFORM for $ARCH"\n`);
  });
});
