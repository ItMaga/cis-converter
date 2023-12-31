import { parse, stringify } from "yaml";

type SupportedCI = "github" | "gitlab";
type Source = {
  type: SupportedCI;
  code: ReturnType<typeof parse>;
};

export default class CIConverter {
  private source: Source;
  private target: SupportedCI;
  private variablesMap: Record<string, string> = {
    $CI_COMMIT_BRANCH: "github.ref",
  } as const;

  constructor(
    source: { type: SupportedCI; code: string },
    target: SupportedCI,
  ) {
    this.source = {
      type: source.type,
      code: parse(source.code),
    };
    this.target = target;
  }

  public convert() {
    if (this.source.type === this.target) return this.source.code;

    switch (this.target) {
      case "github":
        return this.convertGitlabToGithub();
      case "gitlab":
        return this.convertGithubToGitlab();
      default:
        throw new Error("Unsupported CI");
    }
  }

  private convertGithubConditionToGitlab(condition: string): string {
    if (condition.startsWith("contains") && condition.includes("github.ref")) {
      const notAlphaRegex = /[^a-zA-Z]/g;
      const refTarget = condition
        .split(",")[1]
        .trim()
        .replaceAll(notAlphaRegex, "");
      return `$CI_COMMIT_REF_NAME =~ /${refTarget}/`;
    }
    return condition;
  }
  private convertGithubToGitlab() {
    const { code } = this.source;

    const hiddenJobs = {
      name: ".parallel-hidden-job",
    };
    const jobsToStages = Object.keys(code.jobs).reduce<Record<string, unknown>>(
      (acc, stage) => {
        const job = code.jobs[stage];

        if ("container" in job) {
          job.image = job.container;
          delete job.container;
        }

        if ("strategy" in job && "matrix" in job.strategy) {
          for (const [key, value] of Object.entries(job.strategy.matrix)) {
            const keyUpper = key.toUpperCase();
            if (hiddenJobs[keyUpper]) {
              hiddenJobs[keyUpper].add(...value);
            } else {
              hiddenJobs[keyUpper] = new Set(value);
            }
          }
          job.extends = hiddenJobs.name;

          delete job.strategy;
        }

        job.stage = stage;

        job.script = job.steps
          .map((step: Record<string, unknown>) => step.run)
          .filter(Boolean);

        if ("if" in job) {
          job.rules = [
            {
              if: this.convertGithubConditionToGitlab(job.if),
            },
          ];
          delete job.if;
        }

        delete job["runs-on"];
        delete job.steps;

        acc[`${stage}-job`] = job;

        return acc;
      },
      {},
    );

    const gitlab = {
      stages: Object.keys(code.jobs),
      ...(Object.keys(hiddenJobs).length > 1 && {
        [hiddenJobs.name]: {
          parallel: {
            matrix: {
              ...hiddenJobs,
              name: undefined,
            },
          },
        },
      }),
      ...jobsToStages,
      variables: code.env,
      ...code,
    };
    delete gitlab.jobs;
    delete gitlab.on;

    return stringify(gitlab);
  }

  private convertGitlabConditionToGithub(condition: string): string {
    if (condition.includes("==")) {
      const glVariable = condition.split("==")[0].trim();
      const glValue = condition.split("==")[1].trim();

      const ghVariable = this.variablesMap[glVariable];

      return `contains(${ghVariable}, ${glValue})`;
    }
    return condition;
  }
  private convertGitlabToGithub() {
    const { code } = this.source;

    const stages = code.stages as string[];
    const images = code.default as Record<string, unknown> | undefined;
    const jobsFromStages = stages.reduce<Record<string, unknown>>(
      (acc, stage) => {
        const job = code[stage];

        if (job.rules) {
          job.if = this.convertGitlabConditionToGithub(job.rules[0].if);
          delete job.rules;
        }

        job["runs-on"] = "ubuntu-latest";

        if (images) {
          job.container = images.image;
        } else if ("image" in job) {
          job.container = job.image;
          delete job.image;
        }

        job.steps = job.script.map((run: string) => ({ run }));

        delete job.script;
        delete job.stage;
        delete code[stage];
        delete job.artifacts;

        acc[stage] = job;

        return acc;
      },
      {},
    );
    delete code.stages;
    delete code.default;

    const github = {
      on: ["push"],
      jobs: jobsFromStages,
      env: code.variables,
      ...code,
    };
    delete code.variables;

    return stringify(github);
  }
}
