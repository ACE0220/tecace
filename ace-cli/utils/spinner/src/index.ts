import ora from 'ora';

let oraInsance: ora.Ora;

export function spinnerStart(msg: string) {
  oraInsance = ora(msg + '\n').start();
}

export function spinnerStop() {
  return oraInsance.stop();
}

export function spinnerSucced(text?: string) {
  return oraInsance.succeed(text);
}

export function spinnerFail(text?: string) {
  return oraInsance.fail(text);
}
