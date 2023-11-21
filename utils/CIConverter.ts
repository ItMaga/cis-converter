import { parse, stringify } from "yaml";

type SupportedCI = "github" | "gitlab";
type Source = {
  type: SupportedCI;
  code: ReturnType<typeof parse>;
};

export default class CIConverter {
  private source: Source;
  private target: SupportedCI;

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

  private convertGithubToGitlab() {
    const { code } = this.source;

    const stageDetails = Object.keys(code.jobs).reduce<Record<string, unknown>>(
      (acc, stage) => {
        const job = code.jobs[stage];
        job.stage = stage;
        job.script = job.steps.map((step: Record<string, unknown>) => step.run);
        delete job["runs-on"];
        delete job.steps;
        acc[stage] = job;
        return acc;
      },
      {},
    );

    const gitlab = {
      stages: Object.keys(code.jobs),
      ...stageDetails,
      variables: code.env,
      ...code,
    };
    delete gitlab.jobs;
    delete gitlab.on;

    return stringify(gitlab);
  }

  private convertGitlabToGithub() {
    const { code } = this.source;

    const stages = code.stages as string[];
    const jobsFromStages = stages.reduce<Record<string, unknown>>(
      (acc, stage) => {
        const job = code[stage];
        job["runs-on"] = "ubuntu-latest";
        job.steps = job.script.map((run: string) => ({ run }));
        delete job.script;
        delete job.stage;
        acc[stage] = job;
        delete code[stage];
        return acc;
      },
      {},
    );

    const github = {
      on: ["push"],
      jobs: jobsFromStages,
      env: code.variables,
      ...code,
    };
    delete github.stages;
    delete github.variables;

    return stringify(github);
  }
}
