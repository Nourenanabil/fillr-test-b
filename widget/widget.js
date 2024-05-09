"use strict";

const TOP_FRAME_LOCATION = "/context.html";
const TOP_WINDOW_URL = "http://localhost:9999/?id=25360429";
const INPUT_FIELDS = ["input", "select", "textarea"];

function getTopFrame() {
  return window.top.frames[0];
}

function isTopFrame() {
  return window.location.pathname === TOP_FRAME_LOCATION;
}

function sendFieldsToTopWindow(fields) {
  getTopFrame().postMessage(fields, TOP_WINDOW_URL);
}

const sortByNameAscending = (array) => {
  return array.slice().sort((a, b) => {
    const nameA = Object.keys(a)[0];
    const nameB = Object.keys(b)[0];
    return nameA.localeCompare(nameB);
  });
};

function countFrames(windowObj) {
  let count = 0;

  for (let i = 0; i < windowObj.frames.length; i++) {
    count++;
    count += countFrames(windowObj.frames[i]);
  }

  return count;
}

function scrapeFields() {
  try {
    const form = window.document.querySelector("form");
    if (!form) {
      return [];
    }

    const inputs = form.querySelectorAll(INPUT_FIELDS.join(", "));
    return Array.from(inputs).map(({ id, name }) => {
      const labelElement = form.querySelector(`label[for="${id}"]`);
      return { [name]: labelElement?.textContent };
    });
  } catch (error) {
    console.error("Error scraping fields:", error);
  }
}

function execute(totalFrames) {
  try {
    const fields = scrapeFields();

    if (!isTopFrame()) {
      sendFieldsToTopWindow(fields);
      return;
    }

    let mergedFields = [];
    mergedFields.push(...fields);
    let countFrames = 0;

    getTopFrame().addEventListener("message", ({ data }) => {
      console.log("Received fields from child frame:", data);
      countFrames++;
      mergedFields.push(...data);

      if (countFrames === totalFrames) {
        const sortedFields = sortByNameAscending(mergedFields);
        const framesLoadedEvent = new CustomEvent("frames:loaded", {
          detail: { fields: sortedFields },
        });
        window.document.dispatchEvent(framesLoadedEvent);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

const totalFrames = countFrames(window.top);
execute(totalFrames);
