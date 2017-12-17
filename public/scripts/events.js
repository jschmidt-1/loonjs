// Copyright (c) 2017 Jannis Schmidt
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

(function(loon) {
    "use strict";

    var buttonLoad;
    var inputSubreddit;
    var selectCategory;
    var selectLimit;

    var sorter;
    var orderBy = "score";

    //Clears the form before populating with new data if set to true
    var reload = false;

    
    /**
     * Loads requested data and handles the presentation
     */
    function load() {
        var subreddit = normalize(inputSubreddit.value);
        if(reload) {
            loon.entry.clear();
            reload = false;
        }
        loon.reddit[selectCategory.value](subreddit, { 
            limit: +selectLimit.value,
            g: "GLOBAL"
        })
        .then(posts => loon.entry.addPostings(posts))
        .then(_ => order())
        .catch(function(err) {
            console.error(err);
        });
    }
    
    /**
     * Normalize URL component
     * @param  {string} input - Input string
     */
    function normalize(input) {
        //FIXME: Does not handle most unhappy paths - Incomplete
        return input.replace(/\s+/g,"_");
    }
    
    /**
     * Initializes the form and setups the starting state
     */
    function init() {
        buttonLoad = document.getElementById("btn_load");
        selectLimit = document.getElementById("select_limit");
        selectCategory= document.getElementById("select_category");
        inputSubreddit = document.getElementById("input_subreddit");
        sorter = document.getElementById("sorter");
        fillOptions();
        attachEvents();

        setButtonState();
        load();
    }

    /**
     * Sets default state of the main form
     * Populates most elements with static data
     */
    function fillOptions() {
        //Searchbox
        inputSubreddit.value = "meme";
        
        //Limit selector
        for(let i = 15; i <= 60; i+=15) {
            selectLimit.appendChild(createOption(i));
        }

        //Category selector
        //TODO: Some i18n support -> Extract to resource file
        [
            {
                label: "Beliebt",
                value: "hot"
            },
            {
                label: "Neu",
                value: "new"
            },
            {
                label: "Top",
                value: "top"
            },
            {
                label: "Kontrovers",
                value: "controversial"
            }
        ].forEach(entry => selectCategory.appendChild(createOption(entry.label, entry.value)));
    }
    
    /**
     * Enables or disables the load button
     */
    function setButtonState() {
        //Disable button if no subreddit is selected.. otherwise enable
        buttonLoad.disabled = !inputSubreddit.value;
    }

    /**
     * Creates option DOM elements
     * @param  {string} label - Label
     * @param  {string} value - (Optional) value, defaults to label if unset or empty
     */
    function createOption(label, value) {
        var option = document.createElement("option");
        option.value = value || label;
        option.appendChild(document.createTextNode(label));
        return option;
    }

    
    /**
     * Ordering handler for the main content view
     * Sorts elements based on the selected sort value in descending order
     * @param  {object} event - (Optional) Sorter change event
     */
    function order(event) {
        if(event) {
            orderBy = event.target.value;
        }
        if(!orderBy) {
            return;
        }
        var entries = document.getElementsByClassName("entry");
        [].slice.call(entries)
            .sort((a,b) => +b.dataset[orderBy] - +a.dataset[orderBy])
            .forEach((element, i) => element.style.order = i);
    }

    /**
     * Single point for attaching events to static UI elements
     */
    function attachEvents() {
        buttonLoad.addEventListener("click", load);
        inputSubreddit.addEventListener("input", setButtonState);
        inputSubreddit.addEventListener("change", _ => reload = true);
        selectCategory.addEventListener("change", _ => reload = true);
        sorter.addEventListener("change", order);
    }
    
    //We wait for the DOM before initializing
    document.addEventListener("DOMContentLoaded", init, false);

    //Export as a module
    loon.events = {
        load: load
    };
})(this.loon || (this.loon = {}));