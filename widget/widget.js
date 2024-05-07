"use strict";
// Write your module here
// It must send an event "frames:loaded" from the top frame containing a list of { name:label } pairs,
// which describes all the fields in each frame.

// This is a template to help you get started, feel free to make your own solution.

//Add scrapeFields function to access fields within a form
function scrapeFields() {
  try {
    const form = window.document.querySelector("form");
    console.log("Form content", form);

    if (form) {
      // Get all input fields within the form
      const fields = {};
      const inputs = form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        console.log(input, "input");

        const labelElement = form.querySelector(`label[for="${input.id}"]`);

        // Extract the label text or use a default label if no label element found
        const label = labelElement ? labelElement.textContent : "Unnamed";
        console.log(label, "label");

        // // Add the input name and its label to the fields object
        fields[input.name] = label;
      });
      window.top.postMessage({ fields }, "http://localhost:9999/?id=25360429");
    }
  } catch (error) {
    console.error("Error scraping fields:", error);
  }
}

function execute() {
  try {
    // Step 1 Scrape Fields and Create Fields list object.
    // Step 2 Add Listener for Top Frame to Receive Fields.

    scrapeFields();

    if (isTopFrame()) {
      window.top.addEventListener("message", (event) => {
        console.log("Received fields from child frame:", event?.data);

        // - Merge fields from frames.
        // - Process Fields and send event once all fields are collected.
      });
    } else if (!isTopFrame()) {
      // Child frames sends Fields up to Top Frame.
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
