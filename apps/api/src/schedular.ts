import { FlagCollection } from './collections/Flag';
import { reportError } from './common/bugsnag';
import { dispatchTask } from './dispatch';
import { AppTask } from './types';

const intervals: NodeJS.Timeout[] = [];

export function stopSchedular() {
  intervals.forEach(id => {
    clearInterval(id);
  });
}

export function runEvery(appTask: AppTask, ms: number) {
  const run = async () => {
    try {
      const tickTime = Math.floor(Date.now() / ms) * ms;
      const flagId = `${appTask.type}:${tickTime}`;
      const exists = await FlagCollection.findOneAndUpdate(
        {
          _id: flagId,
        },
        {
          $setOnInsert: {
            _id: flagId,
          },
        },
        {
          upsert: true,
        }
      )
        .then(ret => !!ret.value)
        .catch(() => true);
      if (exists) {
        return;
      }
      await dispatchTask(appTask);
    } catch (e: any) {
      reportError({
        error: e,
        source: 'schedular',
        data: {
          info: 'Error when running task: ' + appTask.type,
        },
      });
    }
  };
  void run();
  intervals.push(setInterval(run, ms));
}

export async function startSchedular() {
  // runEvery(
  //   {
  //     type: 'CheckIdleVms',
  //     payload: {},
  //   },
  //   getDuration(5, 'm')
  // );
}
