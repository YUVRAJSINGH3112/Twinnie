import Sandbox from "e2b";

export async function getSandboxUrl(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  return sandbox;
}