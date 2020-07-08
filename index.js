const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

const { context } = github;

// Vercel
const vercelToken = core.getInput("vercel-token", { required: true });
const vercelPreviewUrl = core.getInput("vercel-preview-url", {
  required: true
});
const vercelTargetUrl = core.getInput("vercel-target-url", { required: true });
const vercelOrgId = core.getInput("vercel-org-id", { required: true });
const vercelProjectId = core.getInput("vercel-project-id", { required: true });

async function setEnv() {
  core.info("set environment for vercel cli");
  if (vercelOrgId) {
    core.info("set env variable : VERCEL_ORG_ID");
    core.exportVariable("VERCEL_ORG_ID", vercelOrgId);
  }
  if (vercelProjectId) {
    core.info("set env variable : VERCEL_PROJECT_ID");
    core.exportVariable("VERCEL_PROJECT_ID", vercelProjectId);
  }
}

async function vercelAlias() {
  let myOutput = "";
  // eslint-disable-next-line no-unused-vars
  let myError = "";
  const options = {};
  options.listeners = {
    stdout: data => {
      myOutput += data.toString();
      core.info(data.toString());
    },
    stderr: data => {
      myError += data.toString();
      core.info(data.toString());
    }
  };

  await exec.exec(
    "npx",
    ["vercel alias", vercelPreviewUrl, vercelTargetUrl, "-t", vercelToken],
    options
  );

  return myOutput;
}

async function run() {
  core.debug(`action : ${context.action}`);
  core.debug(`ref : ${context.ref}`);
  core.debug(`eventName : ${context.eventName}`);
  core.debug(`actor : ${context.actor}`);
  core.debug(`sha : ${context.sha}`);
  core.debug(`workflow : ${context.workflow}`);

  await setEnv();

  const success = await vercelAlias();
  if (success) {
    core.info("set aliasing success output");
    core.setOutput("success", true);
  } else {
    core.warning("get aliasing error");
  }
}

run().catch(error => {
  core.setFailed(error.message);
});
