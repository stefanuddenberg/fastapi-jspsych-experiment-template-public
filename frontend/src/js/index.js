// * JS
import DataFrame from "dataframe-js";
import instructions_trial from "jspsych/plugins/jspsych-instructions";
import external_html from "jspsych/plugins/jspsych-external-html";
import render_mustache_template from "./render-mustache-template";
import image_slider_response from "./image-slider-response";
import keypress_duration_trial from "./keypress-duration-trial";
import single_stim_rev_cor_trial from "./single-stim-rev-cor-trial";
import {
  generateCompletionCode,
  generateInstructionsWithMustache,
  getExperimentInfo,
  getWorkerInfo,
  getUrlParameter
} from "./utils";
import { getStimuli, getMorphStimuli } from "./stimuli";
import { generateSingleStimulusRevCorTrials } from "./trials";
import runExperiment from "./experiment";

// * CSS
import "jspsych/css/jspsych.css";
import "bootswatch/dist/flatly/bootstrap.min.css";
import "@dashboardcode/bsmultiselect/dist/css/BsMultiSelect.min.css";
import "../css/index.css";

(async function () {
  // Can set information for the frontend in optional client.env -- see webpack.config.js

  const worker_info = getWorkerInfo();

  console.log("!worker_info.PROLIFIC_PID", !worker_info.PROLIFIC_PID);

  if (!worker_info.PROLIFIC_PID && !worker_info.workerId && !worker_info.participantId) {
    alert(
      "We couldn't find your worker ID. Please try clicking the link again.",
    );
    return;
  }


  let configuration_info = await getExperimentInfo({ worker_info });
  let {
    debug_mode,
    estimated_task_duration,
    compensation,
    experiment_title,
    experiment_name,
    version_date,
    open_tags,
    close_tags,
    stimulus_width,
    stimulus_height,
    slider_width,
    slider_amount_visible,
    image_dir,
    example_image_dir,
    extension,
    num_stimuli,
    percent_repeats,
    min_gap_between_repeats,
    intertrial_interval,
    show_slider_delay,
    reading_speed,
  } = configuration_info;


  // * Constants
  let logrocket_id;
  const tags = [open_tags, close_tags];
  const example_image = `${example_image_dir}example_rc_faces.jpg`;
  const completion_code = generateCompletionCode("exa", "mple");
  const reading_speed_button_delay_type = reading_speed > 0 ? "enable" : "none"; // enable | show | none
  const preload_stimuli = [example_image];
  const trial_types = [
    instructions_trial,
    external_html,
    render_mustache_template,
    keypress_duration_trial,
    single_stim_rev_cor_trial
  ];


  const condition_info = {
    sex: {
      description: "a male or a female",
      first_category: "female",
      second_category: "male",
      between_category: "not sure",
    },
    gender: {
      description: "a woman or a man",
      first_category: "woman",
      second_category: "man",
      between_category: "not sure",
    },
    leader: {
      description: "a good leader or a bad leader",
      first_category: "good leader",
      second_category: "bad leader",
      between_category: "not sure",
    },
  };

  const condition_code_to_condition = {
    s: "sex",
    g: "gender",
    l: "leader",
  };

  const condition_code = getUrlParameter("cond") || "l";
  const condition = condition_code_to_condition[condition_code];

  const response_keys = {
    first_category: "f",
    between_category: "space",
    second_category: "j",
  };

  const stimulus_csv = `src/csv/stimulus.csv`;
  let stimulus_df = await DataFrame.fromCSV(stimulus_csv);
  stimulus_df = stimulus_df.cast("stimulus", Number);

  const { main_stimuli } = getStimuli({
    stimulus_df,
    num_stimuli,
    extension,
    image_dir,
  });

  const pages = [
    `<p class="text-left instructions">
    In this study, you will perform some simple judgments and
    then fill out a few surveys. In this first part of the study,
    you will see a face and need to
    choose whether it best resembles the face of ${condition_info[condition].description
    }.
    You can do this by pressing <kbd>${response_keys.first_category.toUpperCase()}</kbd>
    to respond '${condition_info[condition].first_category
    }' and <kbd>${response_keys.second_category.toUpperCase()}</kbd>
    to respond '${condition_info[condition].second_category}'.
    If you are not sure which of the two responses to give, you can press
    <kbd>${response_keys.between_category}</kbd>
    to respond '${condition_info[condition].between_category}'.
    There will be reminders of these keys under every face.
    </p>
    `,
    `<p class="text-left instructions">
    This task may be difficult, and sometimes you may feel like
    you are guessing. That's okay;
    we're interested in your gut reaction, so just try to
    give your best guess even if it feels hard.
    </p>
    `,
    `<p class="text-left instructions">
    On some pages, you may see repeated faces. Just respond to those as you
    normally would.
    </p>
    `,
    `<p class="text-left instructions">
    That's it for the instructions! To sum up, simply 
    choose whether each face best resembles ${condition_info[condition].description}. 
    Click "Next" when you are ready to begin.
    </p>
    `,
  ];

  const prompt = `<p class="text-center h-4 my-3">
  <kbd>${response_keys.first_category.toUpperCase()}</kbd>: ${condition_info[condition].first_category
    } | <kbd>${response_keys.between_category}</kbd>: ${condition_info[condition].between_category
    } | <kbd>${response_keys.second_category.toUpperCase()}</kbd>: ${condition_info[condition].second_category
    }
  </p>`;

  const instructions = await generateInstructionsWithMustache({
    pages,
    tags,
    post_trial_gap: intertrial_interval,
    reading_speed_button_delay_type,
    reading_speed,
  });

  async function generateTrials() {
    const main_trials =
      generateSingleStimulusRevCorTrials({
        type: single_stim_rev_cor_trial.info.name,
        preamble: null,
        main_stimuli,
        percent_repeats,
        min_gap_between_repeats,
        choices: Object.values(response_keys),
        choice_labels: [
          condition_info[condition].first_category,
          condition_info[condition].between_category,
          condition_info[condition].second_category,
        ],
        stimulus_width,
        stimulus_height,
        prompt,
        condition,
        post_trial_gap: 0,
      });

    const timeline = [
      ...main_trials,
    ]

    return timeline;
  }

  runExperiment({
    debug_mode,
    tags,
    compensation,
    worker_info,
    preload_stimuli,
    experiment_name,
    experiment_title,
    condition,
    logrocket_id,
    trial_types,
    instructions,
    version_date,
    intertrial_interval, // in ms
    compensation, // str: in dollars
    estimated_task_duration, // str: in min
    completion_code,
    generateTrials,
  });
})();
