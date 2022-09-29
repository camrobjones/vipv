/* === VIPV Experiment === */

var trial_id = 0;

/* ===== Utils ==== */

function store_response_wm(data) {
  // Map key press codes to choices

  if (data.response == "c") {
    data.response_hr = "Same";
  } else if (data.response == "b") {
    data.response_hr = "Different";
  } else {
    data.response_hr = "<Other>";
  }
  data.is_correct = data.response_hr === data.correct_response;
}


function store_response_pv(data) {
  // Map key press codes to choices

  if (data.response == "1") {
    data.response_hr = true;
  } else if (data.response == "3") {
    data.response_hr = false;
  } else {
    data.response_hr = "<Other>";
  }
  data.is_correct = data.response_hr === data.correct_response;
}


/* ==== Preload ==== */

/* preload stims */

var preload = {
  type: jsPsychPreload,
  audio: function() {
      let fnames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                    31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]
      let stims = fnames.map(x => `/static/vipv/stimuli/${x}.wav`);
      return stims;
  },
  images: function () {
    let fnames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
                  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]
      let stims = fnames.map(x => `/static/vipv/stimuli/${x}.bmp`);
      return stims;
    }
};


/* ===== Trial ===== */


/* ----- WM Load ----- */


var WM_trial_instruction = {
      timeline: [
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: jsPsych.timelineVariable("wm_instruction"),
          choices: "NO_KEYS",
          trial_duration: 1500
        }
      ],
      conditional_function: function() {
        return jsPsych.timelineVariable("wm_load") != "0"
      }
    };

var vis_encode_1 = {
    timeline: [
      {
        type: jsPsychImageKeyboardResponse,
        stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('image1')
        },
        choices: "NO_KEYS",
        trial_duration: 500,
        post_trial_gap: 750
      }
    ],
    conditional_function: function() {
      return jsPsych.timelineVariable("wm_modality") == "vi" && jsPsych.timelineVariable("wm_load") == "1"
    }
  };

var vis_encode_3 = {
    timeline: [
      {
        type: jsPsychImageKeyboardResponse,
        stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('image1')
        },
        choices: "NO_KEYS",
        trial_duration: 500,
        post_trial_gap: 500,
      },
      {
        type: jsPsychImageKeyboardResponse,
        stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('image2')
        },
        choices: "NO_KEYS",
        trial_duration: 500,
        post_trial_gap: 500,
      },
      {
        type: jsPsychImageKeyboardResponse,
        stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('image3')
        },
        choices: "NO_KEYS",
        trial_duration: 500,
        post_trial_gap: 1500,
      }
    ],
    conditional_function: function() {
      return jsPsych.timelineVariable("wm_modality") == "vi" && jsPsych.timelineVariable("wm_load") == "3"
    }
  };


var aud_encode_1 = {
    timeline: [
    {
      type: jsPsychAudioKeyboardResponse,
      stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('son')
      },
      choices: "NO_KEYS",
      trial_duration: 500,
      post_trial_gap: 750
      }
    ],
    conditional_function: function() {
      return jsPsych.timelineVariable("wm_modality") == "au" && jsPsych.timelineVariable("wm_load") == "1"
    }
};

var aud_encode_3 = {
    timeline: [
    {
      type: jsPsychAudioKeyboardResponse,
      stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('son')
      },
      choices: "NO_KEYS",
      trial_duration: 2500,
      post_trial_gap: 1500
      }
    ],
    conditional_function: function() {
      return jsPsych.timelineVariable("wm_modality") == "au" && jsPsych.timelineVariable("wm_load") == "3"
    }
};

// WM Recall

var vis_recall_1 = {
    timeline: [
      {
        type: jsPsychImageKeyboardResponse,
        stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('image1b')
        },
        choices: "NO_KEYS",
        trial_duration: 500,
        // post_trial_gap: 750
      }
    ],
    conditional_function: function() {
      return jsPsych.timelineVariable("wm_modality") == "vi" && jsPsych.timelineVariable("wm_load") == "1"
    }
  };

var vis_recall_3 = {
    timeline: [
      {
        type: jsPsychImageKeyboardResponse,
        stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('image1b')
        },
        choices: ["b", "c"],
        trial_duration: 500,
        post_trial_gap: 500,
      },
      {
        type: jsPsychImageKeyboardResponse,

        stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('image2b')
        },
        choices: "NO_KEYS",
        trial_duration: 500,
        post_trial_gap: 500,
      },
      {
        type: jsPsychImageKeyboardResponse,
        stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('image3b')
        },
        choices: "NO_KEYS",
        trial_duration: 500,
        // post_trial_gap: 1500,
      }
    ],
    conditional_function: function() {
      return jsPsych.timelineVariable("wm_modality") == "vi" && jsPsych.timelineVariable("wm_load") == "3"
    }
  };


var aud_recall_1 = {
    timeline: [
    {
      type: jsPsychAudioKeyboardResponse,
      stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('sonb')
      },
      choices: "NO_KEYS",
      trial_duration: 500,
      // post_trial_gap: 750
      }
    ],
    conditional_function: function() {
      return jsPsych.timelineVariable("wm_modality") == "au" && jsPsych.timelineVariable("wm_load") == "1"
    }
};

var aud_recall_3 = {
    timeline: [
    {
      type: jsPsychAudioKeyboardResponse,
      stimulus: function(){
          return "/static/vipv/stimuli/"+jsPsych.timelineVariable('sonb')
      },
      choices: "NO_KEYS",
      trial_duration: 2500,
      // post_trial_gap: 1500
      }
    ],
    conditional_function: function() {
      return jsPsych.timelineVariable("wm_modality") == "au" && jsPsych.timelineVariable("wm_load") == "3"
    }
};


var WM_recall_response = {

    timeline: [
      {
        type: jsPsychHtmlKeyboardResponse,
        data: function() {
          return {
              trial_part: 'trial',
              task: 'WM',
              item: jsPsych.timelineVariable('item_id'),
              item_id: jsPsych.timelineVariable('item_id'),
              block_id: jsPsych.timelineVariable('block_id'),
              trial_id: jsPsych.timelineVariable('trial_id'),
              item_type: jsPsych.timelineVariable('item_type'),
              version: jsPsych.timelineVariable('wm_load'),
              version_id: jsPsych.timelineVariable('wm_load') + "_" + jsPsych.timelineVariable('wm_modality'),
              condition: jsPsych.timelineVariable('wm_modality'),
              correct_response: jsPsych.timelineVariable('correct_response_wm')
          };
        },
        stimulus: `
          <p>Were the sequences identical or different?</p>


          <div class='response-container'> 

            <div class='response np1'>

                <div class='key-reminder-container'>
                  <div class='key-reminder'>
                    C
                  </div>
                </div>

                <div class='response-label'>
                  Identical
                </div>
                
              </div> 

              <div class='response np2'>

                <div class='key-reminder-container'>
                  <div class='key-reminder'>
                    B
                  </div>
                </div>
                
                <div class='response-label'>
                  Different
                </div>

              </div> 

            </div>

          </div>

        `,
        choices: ["b", "c"],
        post_trial_gap: 1000,
        on_finish: function(data) {
          store_response_wm(data);
        }
      }
      ],
      conditional_function: function() {
      return jsPsych.timelineVariable("wm_load") != "0"
    }
    };



/* ----- PV ----- */

// PV Trial
var pvTrial = {

  // Meta data
  type: jsPsychHtmlKeyboardResponse,
  choices: ['1', '3'],
  post_trial_gap: 500,
  data: function() {
    return {
        trial_part: 'trial',
        task: 'PV',
        item: jsPsych.timelineVariable('item_id'),
        item_id: jsPsych.timelineVariable('item_id'),
        block_id: jsPsych.timelineVariable('block_id'),
        trial_id: jsPsych.timelineVariable('trial_id'),
        item_type: jsPsych.timelineVariable('item_type'),
        version: "",
        version_id: "",
        condition: jsPsych.timelineVariable('pv_modality'),
        correct_response: jsPsych.timelineVariable('correct_response_pv')
    };
  },
  // Build stimulus
  stimulus: function() {

    // Get trial variables
    let concept = jsPsych.timelineVariable('concept');
    let property = jsPsych.timelineVariable('property');

    // Build trial template
    let s = `
      <div class='trial-container'>

        <div class='pv-container'>

          <p class='pv-concept'>${concept}</p> 
          <p class='pv-can-be'>can be</p> 
          <p class='pv-property'>${property}</p> 

        </div>

        <div class='response-container'> 

          <div class='response np1''>

            <div class='key-reminder-container'>
              <div class='key-reminder'>
                1
              </div>
            </div>

            <div class='response-label'>
              True
            </div>
            
          </div> 

          <div class='response np2''>

            <div class='key-reminder-container'>
              <div class='key-reminder'>
                3
              </div>
            </div>
            
            <div class='response-label'>
              False
            </div>

          </div> 

        </div>
      </div>`;

    return s;
  },
  on_finish: function(data) {
      store_response_pv(data);
      updateProgress();
    }
};

/* ===== Instructions ===== */


// Instructions
var vipv_instructions = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Matching Task
    </h2>
    <p class='instructions'>
      In this task, you will you will decide if a concept can have a certain property
      while remembering a sequence of images or sounds. 
    </p>

    <p class='instructions'>
      First you will practice each of the tasks separately (verifying concept properties, remembering images,
      and remembering sounds).
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to continue to the first practice section.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
    },
};

// Audio Test

function replayAudio(e) {
  e.preventDefault();
  document.getElementById("audio").play()
}

var audioTest = {
    type: jsPsychSurveyHtmlForm,
    html: `
      <p class='instructions'>
        In order to participate in this experiment you need to be
        able to hear the sounds that are played.</p>

      <p class='instructions'>
        Please type the word being spoken into the box below.
        If you can't hear it please adjust your audio and click replay.
      </p>

      <audio id="audio">
        <source src="/static/vipv/stimuli/cat_3.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>

      <div class='input-container'>

        <button id="audioTestReplay" class="jspsych-btn" onclick="document.getElementById('audio').play()"
        type="button">
          Replay
        </button>

        <input type="text"/ id="audioTestInput" class="form-control" name="audioTestInput">

      </div>`,
      on_load: function() {
        let audio = document.getElementById("audio");
        
        if (audio) {
          audio.play();
        }
      }
};

var audioTestLoop = {
    timeline: [audioTest],
    loop_function: function(data){
        if(data.values()[0].response.audioTestInput == "cat"){
            return false;
        } else {
            return true;
        }
    }
};

// Combined Task Instructions
var vipv_main_instructions = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Combined Task
    </h2>

    <p class='instructions'>
      Now we will combine the memory and property verification tasks. First you will see a sequence of
      images or hear a sequence of sounds. Then, while you remember the sequence, you will
      decide if a concept can have a certain property. Finally you will be presented with
      a second sequence of images or sounds and you will decide if it is identical or different to
      the first sequence.
    </p>

    <p class='instructions'>
      On some trials, there will not be any sequence to remember, and you will only have to verify a property.
      On other trials there will be a sequence of either 1 or 3 elements.
      You will no longer receive feedback on your responses.
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to continue to begin.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
    },
};


/* ===== Practice ==== */

var practice_buffer = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: "<p>End of sequence</p>",
      choices: "NO_KEYS",
      trial_duration: 1500,
    };


var wm_practice_feedback = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    let last_trial = jsPsych.data.get().last(1).values()[0];
    let outcome = last_trial.is_correct ? "Correct" : "Incorrect"
    let correct_response = last_trial.correct_response == "Same" ? "identical" : "different"
    return `
      <h3>${outcome}</h3>
      <p>The sequences were ${correct_response}.</p>
      `
  },
  choices: "NO_KEYS",
  trial_duration: 2000,
}

var pv_practice_feedback = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    let last_trial = jsPsych.data.get().last(1).values()[0];
    let outcome = last_trial.is_correct ? "Correct" : "Incorrect"
    let correct_response = last_trial.correct_response == true ? "true" : "false"
    return `
      <h3>${outcome}</h3>
      <p>The statement was ${correct_response}.</p>
      `
  },
  choices: "NO_KEYS",
  trial_duration: 2000,
}

/* ---- Visual WM Practice ---- */

var vis_practice_instructions = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Image Memory Practice
    </h2>
    <p class='instructions'>
      In this section, you will remember images. First you will see a sequence of either 1 or 3 images.
      After a short pause, a second sequence of images will be presented. Your task is to decide if the
      second sequence is identical to the first.
    </p>

    <p class='instructions'>
      Give your response using the keyboard: use the <span class='key-demo'>C</span>
      key to indicate that the sequence is  <b>identical</b>, and the 
      <span class='key-demo'>B</span> key to indicate that the sequence is 
      <b>different</b>.
    </p>

    <p class='instructions'>
      After you give your response, you will receive feedback on whether your response was
      correct or incorrect.
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to begin.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
  },
};

let vis_practice_data = [
  {
    item: "vis_practice_1",
    item_id: "vis_practice_1",
    block_id: "vis_practice_1",
    trial_id: "vis_practice_1_1",
    item_type: "practice",
    wm_modality: 'vi',
    wm_load: 1,
    wm_instruction: 'You will see 1 image',
    image1: "8.bmp",
    image1b: "8.bmp",
    image2: "",
    image2b: "",
    image3: "",
    image3b: "",
    son: "",
    sonb: "",
    correct_response_wm: "Same"
  },
  {
    item: "vis_practice_2",
    item_id: "vis_practice_2",
    block_id: "vis_practice_1",
    trial_id: "vis_practice_1_2",
    item_type: "practice",
    wm_modality: 'vi',
    wm_load: 3,
    wm_instruction: 'You will see 3 images',
    image1: "1.bmp",
    image1b: "1.bmp",
    image2: "2.bmp",
    image2b: "2.bmp",
    image3: "3.bmp",
    image3b: "7.bmp",
    son: "",
    sonb: "",
    correct_response_wm: "Different"
  },
  {
    item: "vis_practice_3",
    item_id: "vis_practice_3",
    block_id: "vis_practice_1",
    trial_id: "vis_practice_1_3",
    item_type: "practice",
    wm_modality: 'vi',
    wm_load: 3,
    wm_instruction: 'You will see 3 images',
    image1: "4.bmp",
    image1b: "4.bmp",
    image2: "5.bmp",
    image2b: "5.bmp",
    image3: "6.bmp",
    image3b: "6.bmp",
    son: "",
    sonb: "",
    correct_response_wm: "Same"
  },
  {
    item: "vis_practice_4",
    item_id: "vis_practice_4",
    block_id: "vis_practice_1",
    trial_id: "vis_practice_1_4",
    item_type: "practice",
    wm_modality: 'vi',
    wm_load: 1,
    wm_instruction: 'You will see 1 image',
    image1: "9.bmp",
    image1b: "10.bmp",
    image2: "",
    image2b: "",
    image3: "",
    image3b: "",
    son: "",
    sonb: "",
    correct_response_wm: "Different"
  }
]

let vis_practice_timeline = {
      timeline: [
        WM_trial_instruction,
        vis_encode_1, vis_encode_3, // Encoding
        practice_buffer,
        vis_recall_1, vis_recall_3, // Recall
        WM_recall_response,
        wm_practice_feedback
      ],
      timeline_variables: vis_practice_data,
      randomize_order: true,
      data: {}
    };

var vis_practice_end = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Image Memory Practice Complete
    </h2>
    <p class='instructions'>
      That concludes the image memory practice.
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to continue.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
  },
};


/* ---- Audio WM Practice ---- */

var aud_practice_instructions = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Sound Memory Practice
    </h2>
    <p class='instructions'>
      In this section, you will remember sounds. First you will hear a sequence of either 1 or 3 sounds.
      After a short pause, a second sequence of sounds will be presented. Your task is to decide if the
      second sequence is identical to the first.
    </p>

    <p class='instructions'>
      Give your response using the keyboard: use the <span class='key-demo'>C</span>
      key to indicate that the sequence is  <b>identical</b>, and the 
      <span class='key-demo'>B</span> key to indicate that the sequence is 
      <b>different</b>.
    </p>

    <p class='instructions'>
      After you give your response, you will receive feedback on whether your response was
      correct or incorrect.
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to begin.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
  },
};

let aud_practice_data = [
  {
    item: "aud_practice_1",
    item_id: "aud_practice_1",
    block_id: "aud_practice_1",
    trial_id: "aud_practice_1_1",
    item_type: "practice",
    wm_modality: 'au',
    wm_load: 1,
    wm_instruction: 'You will hear 1 sound',
    image1: "",
    image1b: "",
    image2: "",
    image2b: "",
    image3: "",
    image3b: "",
    son: "1.wav",
    sonb: "1.wav",
    correct_response_wm: "Same"
  },
  {
    item: "aud_practice_2",
    item_id: "aud_practice_2",
    block_id: "aud_practice_1",
    trial_id: "aud_practice_1_2",
    item_type: "practice",
    wm_modality: 'au',
    wm_load: 3,
    wm_instruction: 'You will hear 3 sounds',
    image1: "",
    image1b: "",
    image2: "",
    image2b: "",
    image3: "",
    image3b: "",
    son: "31.wav",
    sonb: "32.wav",
    correct_response_wm: "Different"
  },
  {
    item: "aud_practice_3",
    item_id: "aud_practice_3",
    block_id: "aud_practice_1",
    trial_id: "aud_practice_1_3",
    item_type: "practice",
    wm_modality: 'au',
    wm_load: 3,
    wm_instruction: 'You will hear 3 sounds',
    image1: "",
    image1b: "",
    image2: "",
    image2b: "",
    image3: "",
    image3b: "",
    son: "33.wav",
    sonb: "33.wav",
    correct_response_wm: "Same"
  },
  {
    item: "aud_practice_4",
    item_id: "aud_practice_4",
    block_id: "aud_practice_1",
    trial_id: "aud_practice_1_4",
    item_type: "practice",
    wm_modality: 'au',
    wm_load: 1,
    wm_instruction: 'You will hear 1 sound',
    image1: "",
    image1b: "",
    image2: "",
    image2b: "",
    image3: "",
    image3b: "",
    son: "4.wav",
    sonb: "5.wav",
    correct_response_wm: "Different"
  }
]

let aud_practice_timeline = {
      timeline: [
        WM_trial_instruction,
        aud_encode_1, aud_encode_3, // Encoding
        practice_buffer,
        aud_recall_1, aud_recall_3, // Recall
        WM_recall_response,
        wm_practice_feedback
      ],
      timeline_variables: aud_practice_data,
      randomize_order: true,
      data: {}
    };

var aud_practice_end = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Sound Memory Practice Complete
    </h2>
    <p class='instructions'>
      That concludes the sound memory practice.
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to continue.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
  },
};


/* ---- PV Practice ---- */

var pv_practice_instructions = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Property Verification Practice
    </h2>
    <p class='instructions'>
      In this section, you will decide if a concept can have a certain property.
      You will see a statement asserting that a concept has a property and your task is decide if the statement is true.
    </p>

    <p class='instructions'>
      Give your response using the keyboard: use the <span class='key-demo'>1</span>
      key to indicate that the statement is  <b>true</b>, and the 
      <span class='key-demo'>3</span> key to indicate that the statement is 
      <b>false</b>.
    </p>

    <p class='instructions'>
      After you give your response, you will receive feedback on whether your response was
      correct or incorrect.
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to begin.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
  },
};

let pv_practice_data = [
  {
    item: "pv_practice_1",
    item_id: "pv_practice_1",
    block_id: "pv_practice_1",
    trial_id: "pv_practice_1_1",
    item_type: "practice",
    version: "",
    version_id: "",
    pv_modality: "au",
    concept: "ALARM",
    property: "ringing",
    correct_response_pv: true
  },
  {
    item: "pv_practice_2",
    item_id: "pv_practice_2",
    block_id: "pv_practice_1",
    trial_id: "pv_practice_1_2",
    item_type: "practice",
    version: "",
    version_id: "",
    pv_modality: "vi",
    concept: "ROBIN",
    property: "lilac",
    correct_response_pv: false
  },
  {
    item: "pv_practice_3",
    item_id: "pv_practice_3",
    block_id: "pv_practice_1",
    trial_id: "pv_practice_1_3",
    item_type: "practice",
    version: "",
    version_id: "",
    pv_modality: "o",
    concept: "BRICK",
    property: "rolled",
    correct_response_pv: false
  },
  {
    item: "pv_practice_4",
    item_id: "pv_practice_4",
    block_id: "pv_practice_1",
    trial_id: "pv_practice_1_4",
    item_type: "practice",
    version: "",
    version_id: "",
    pv_modality: "o",
    concept: "STUDENT",
    property: "clever",
    correct_response_pv: true
  },
]

let pv_practice_timeline = {
      timeline: [
        pvTrial,
        pv_practice_feedback
      ],
      timeline_variables: pv_practice_data,
      randomize_order: true,
      data: {}
    };

var pv_practice_end = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Property Verification Practice Complete
    </h2>
    <p class='instructions'>
      That concludes the property verification practice.
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to continue.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
  },
};



/* ---- Block Instructions ---- */

// Verbal
var interBlockBreak = {
  type: jsPsychHtmlKeyboardResponse,
  choices: "NO_KEYS",
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Block complete
    </h2>

    <p class='instructions'>
      Please take a short break.
    </p>

    <p class='instructions'>
      You will be able to advance to the next block
      after <span id='breakTime'>20</span>s.
    </p>

  </div>`,
  post_trial_gap: 500,
  on_load: function() {
    function decrementTimer() {
      let breakTime = document.getElementById("breakTime");

      if (breakTime == null) {
        return false
      }

      let remaining = breakTime.innerText;

      if (remaining > 1)  {
        remaining -= 1;
        breakTime.innerText = remaining;
        setTimeout(decrementTimer, 1000);
      } 
    };
    let breakTime = document.getElementById("breakTime");
    breakTime.innerText = "20";
    setTimeout(decrementTimer, 1000)
  },
  trial_duration: 20000,
};

// Verbal
var preBlock = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Get Ready
    </h2>

    <p class='instructions'>
      Press the spacebar to begin the next block.
    </p>

  </div>`,
  post_trial_gap: 500,
};


/* ----- Finish ----- */

// Finish
var PVFinish = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Section Complete
    </h2>

    <p class='instructions'>
      That concludes the property verification section of the experiment.
    </p>

    <p class="instructions" id="continue">
      <b>Press the spacebar to continue to the next section.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_finish: updateProgress
};


/* ====== Trial Procedure ===== */

function generate_block(block_data) {

  let trialProcedure = {
      timeline: [
        WM_trial_instruction,
        vis_encode_1, vis_encode_3, aud_encode_1, aud_encode_3, // Encoding
        pvTrial,
        vis_recall_1, vis_recall_3, aud_recall_1, aud_recall_3,
        WM_recall_response
      ],
      timeline_variables: block_data,
      randomize_order: false,
      data: {}
    };

  return trialProcedure;
}




/* ----- Create Timeline ----- */


if ("pv" in tasks) {
  
  var pvTimeline = [vipv_instructions, preload, audioTestLoop]
  var pvTrialCount = 1; // 3

  if (conf.practice) {
    pvTimeline = pvTimeline.concat([
      pv_practice_instructions, pv_practice_timeline, pv_practice_end
      ])
    pvTrialCount += 6;

    if (Math.random() > 0.5) {
      pvTimeline = pvTimeline.concat(
        [vis_practice_instructions, vis_practice_timeline, vis_practice_end,
        aud_practice_instructions, aud_practice_timeline, aud_practice_end]
      )
    } else {
      pvTimeline = pvTimeline.concat(
        [aud_practice_instructions, aud_practice_timeline, aud_practice_end,
        vis_practice_instructions, vis_practice_timeline, vis_practice_end,
        ]
      )
    }

    pvTrialCount += 4;
  }

  pvTimeline = pvTimeline.concat([
    vipv_main_instructions,
    generate_block(tasks.pv[0].items),
    interBlockBreak, preBlock,
    generate_block(tasks.pv[1].items),
    interBlockBreak, preBlock,
    generate_block(tasks.pv[2].items),
    PVFinish
  ])

  pvTrialCount += 2;
  pvTrialCount += tasks.pv.map(x => x.items.length).reduce((a,b)=>a+b);


}


  



