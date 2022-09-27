/* === IRQ Task === */


// Instructions
var instructions = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Statement Agreement Task
    </h2>
    <p class='instructions'>
      In this task, you will be asked to read statements about how you
      think and rate the statements based on how much you agree with them.
    </p>

    <p class='instructions'>
      Each statement will appear on the screen one at a time.
      Below the statement, you will see a 5 point scale for rating the 
      sentences. The scale goes from 1 (Strongly Disagree) to 5 
      (Strongly Agree).
      Click on the scale to indicate your rating and then click the
      continue button to procede.
    </p>

    <p class='instructions' id='continue' ontouchstart="response(32)">
      <b>Press the spacebar to begin this segment.</b>
    </p>
  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
    },
};

// Trial

function irqParseResponse(data) {
    // Parse likert response from html
    data.response = data.response["irq-response"];
}


var irqTrial = {
  // Post Test Questionnaire
  type: jsPsychSurveyHtmlForm,
  data: function() {
    return {
        trial_part: 'trial',
        task: 'irq',
        scale: "IRQ",
        item_id: jsPsych.timelineVariable('item_id'),
        item: jsPsych.timelineVariable('item_id'),
        item_type: jsPsych.timelineVariable('item_type')
    };
  },

  html: function() {
    let sent = jsPsych.timelineVariable('sentence');
    let stimulus = 
        `<div class='question likert irq'>

            <p class='stimulus likert irq'>${sent}</p>

            
            <div class='option-container likert'>

                <div class='radio-option likert'>
                    <label for='irq-response-1' class='radio-label likert'>1</label>
                    <input type='radio' name='irq-response' id='irq-response-1'
                    value="1"/ required class='likert'>
                    <label for='irq-response-1' class='radio-label likert'>
                        Strongly Disagree
                    </label>
                </div>

                <div class='radio-option likert'>
                    <label for='irq-response-2' class='radio-label likert'>2</label>
                    <input type='radio' name='irq-response' id='irq-response-2'
                    value="2"/ required class='likert'>
                </div>

                <div class='radio-option likert'>
                    <label for='irq-response-3' class='radio-label likert'>3</label>
                    <input type='radio' name='irq-response' id='irq-response-3'
                    value="3"/ required class='likert'>
                </div>

                <div class='radio-option likert'>
                    <label for='irq-response-4' class='radio-label likert'>4</label>
                    <input type='radio' name='irq-response' id='irq-response-4'
                    value="4"/ required class='likert'>
                    
                </div>

                <div class='radio-option likert'>
                    <label for='irq-response-5' class='radio-label likert'>5</label>
                    <input type='radio' name='irq-response' id='irq-response-5'
                    value="5"/ required class='likert'>
                    <label for='irq-response-5' class='radio-label likert'>
                        Strongly Agree
                    </label>
                    
                </div>

            </div>

        </div>`;
        return stimulus;
    },
  choices: "NO_KEYS",
  post_trial_gap: 500,
  on_finish: function(data) {
    irqParseResponse(data);
    updateProgress();
  }
};

// Combine fixation, preview, and trial into one component
var irqTrialProcedure = {
  timeline: [irqTrial],
  timeline_variables: tasks.irq
};


// Finish
var finish = {
  type: jsPsychHtmlKeyboardResponse,
  choices: [' '],
  stimulus: 
  `
  <div class='instructions-container'>
    <h2 class='instructions-header'>
      Segment Complete
    </h2>
    <p class='instructions'>
      That concludes this segment of the experiment.
    </p>

    <p class='instructions' id='continue'>
      <b>Press the spacebar to continue to the next segment.</b>
    </p>

  </div>`,
  post_trial_gap: 500,
  on_load: scrollTop,
  on_finish: function() {
    updateProgress();
    },
};


// Create timeline
  if ("irq" in tasks) {
    
  var irqTimeline = [instructions, irqTrialProcedure, finish];

  // Instruction, end, trials
  var irqTrialCount = 2 + tasks.irq.length;

}


