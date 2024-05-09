"use strict";
// Write your module here
// It must send an event "frames:loaded" from the top frame containing a list of { name:label } pairs,
// which describes all the fields in each frame.

// This is a template to help you get started, feel free to make your own solution.

//Add scrapeFields function to access fields within a form

const TOP_WINDOW_URL = "http://localhost:9999/?id=25360429";
const TOTAL_FRAMES = countFrames(window.top);

function scrapeFields() {
  try {
    const form = window.document.querySelector("form");
    console.log("Form content", form);

    if (form) {
      // Get all input fields within the form
      const fields = [];
      const inputs = form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        console.log(input, "input");

        const labelElement = form.querySelector(`label[for="${input.id}"]`);

        // Extract the label text or use a default label if no label element found
        const label = labelElement ? labelElement.textContent : "Unnamed";
        console.log(label, "label");

        // // Add the input name and its label to the fields object
        fields.push({ [input.name]: label });
      });
      return fields;
    }
  } catch (error) {
    console.error("Error scraping fields:", error);
  }
}
function sendFieldsToTopWindow(fields) {
  getTopFrame().postMessage(fields, TOP_WINDOW_URL);
}

function countFrames(windowObj) {
  let count = 0;

  for (let i = 0; i < windowObj.frames.length; i++) {
      count++;
      count += countFrames(windowObj.frames[i]);
  }

  return count;
}

function execute() {
  try {
    // Step 1 Scrape Fields and Create Fields list object.
    // Step 2 Add Listener for Top Frame to Receive Fields.

    const fields = scrapeFields();
    console.log("Total frames:", TOTAL_FRAMES);
    console.log(fields);
    if (isTopFrame()) {

      let mergedFields = [];
      mergedFields.push(...fields);

      getTopFrame().addEventListener("message", ({ data }) => {
        console.log("Received fields from child frame:", data);
        mergedFields.push(...data);
        console.log(mergedFields, "mergedFields")
        // - Merge fields from frames.
        // - Process Fields and send event once all fields are collected.
      });
    } else if (!isTopFrame()) {
      // Child frames sends Fields up to Top Frame.
      sendFieldsToTopWindow(fields);
    }
  } catch (e) {
    console.error(e);
  }
}

execute();

// Utility functions to check and get the top frame
// as Karma test framework changes top & context frames.
// Use this instead of "window.top".
function getTopFrame() {
  return window.top.frames[0];
}

function isTopFrame() {
  return window.location.pathname == "/context.html";
}
