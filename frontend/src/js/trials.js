export function generateSingleStimulusRevCorTrials({
  main_stimuli,
  percent_repeats = 10,
  min_gap_between_repeats = 5,
  type = "single-stim-rev-cor-trial",
  choices = ["f", "space", "j"],
  choice_labels = ["female", "not sure", "male"],
  stimulus_width = 256,
  stimulus_height = 256,
  condition = "XXX",
  preamble = `<p class="instructions text-left my-2"> my cool preamble </p>`,
  prompt = `<h1 class="text-center mt-2 mb-4">Which of these faces looks more like XXX?</h1>`,
  post_trial_gap = 0,
  shuffle = true,
}) {
  // Validation checks
  if (percent_repeats < 0 || percent_repeats > 100) {
    throw new Error("percent_repeats must be between 0 and 100");
  }

  if (min_gap_between_repeats >= main_stimuli.length) {
    throw new Error("min_gap_between_repeats must be less than the total number of unique trials");
  }
  let trials = [];

  let unique_trials = main_stimuli.map((stimulus) => {
    return {
      type,
      stimulus,
      choices,
      choice_labels,
      stimulus_width,
      stimulus_height,
      preamble,
      prompt,
      post_trial_gap,
      data: {
        condition,
        experiment_phase: "main",
        image_shown_count: 1,
        repeat: false,
      },
    };
  });

  if (shuffle) unique_trials = _.shuffle(unique_trials);

  // Select a random `percent_repeats` percentage of main trials to be repeated
  const num_repeat_stimuli = Math.floor((percent_repeats / 100) * unique_trials.length);
  const repeat_trials = _.shuffle(
    _.sampleSize(
      unique_trials.slice(
        0,
        unique_trials.length - min_gap_between_repeats,
      ),
      num_repeat_stimuli,
    ).map((t) => ({
      ...t,
      data: {
        ...t.data,
        experiment_phase: "main_repeat",
        image_shown_count: 2,
        repeat: true,
      },
    })),
  )

  trials = [...unique_trials];

  for (const r of repeat_trials) {
    const matching_trial_index = _.findIndex(
      trials,
      (u) => u.stimulus === r.stimulus && !u.data.repeat,
    );
    const remaining_trial_indexes = _.range(
      matching_trial_index + min_gap_between_repeats,
      trials.length,
    );
    const splice_location = _.sample(remaining_trial_indexes);
    trials.splice(splice_location, 0, r);
  }

  console.log("all trials before splicing:", [
    ...unique_trials,
    ...repeat_trials,
  ]);

  console.log("all trials after splicing:", trials);

  console.log("Confirm that all repeats come after all non-repeats:");
  for (const r of repeat_trials) {
    const nonrepeat_index = _.findIndex(
      trials,
      (u) => u.stimulus === r.stimulus && !u.data.repeat,
    );

    const repeat_index = _.findIndex(
      trials,
      (u) => u.stimulus === r.stimulus && u.data.repeat,
    );

    if (nonrepeat_index > repeat_index)
      console.error(
        `nonrepeat for ${r.stimulus} at ${nonrepeat_index} comes after repeat at ${repeat_index}!`,
      );

    if (repeat_index - nonrepeat_index < min_gap_between_repeats)
      console.error(
        `repeat for ${r.stimulus} at ${repeat_index} comes only ${repeat_index - nonrepeat_index
        } items after first showing at ${nonrepeat_index}!`,
      );
  }

  // Add trial numbers
  trials = trials.map((t, i) => ({ ...t, trial_number: i }));
  // Log all the repeat trials as they appear in the trials array
  console.log("repeat trials:", trials.filter((t) => t.data.repeat));

  return trials;
}