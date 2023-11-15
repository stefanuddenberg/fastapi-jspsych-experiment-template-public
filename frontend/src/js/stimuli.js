import "lodash";

export function getStimuli({
  stimulus_df,
  image_dir = "src/images/main/",
  num_stimuli = 300,
  prefix = "",
  extension = ".jpg",
}) {
  const possible_stimuli = stimulus_df.select("stimulus").toArray();

  const main_stimulus_numbers = possible_stimuli.slice(0, num_stimuli);


  return {
    main_stimuli: main_stimulus_numbers.map(
      (i) => `${image_dir}${prefix}${i}${extension}`,
    ),
  };
}
