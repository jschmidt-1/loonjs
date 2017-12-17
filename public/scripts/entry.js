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

    //Container for entries
    const ENTRY_CONTAINER = "entry_container";
    var container;
    
    /**
     * Adds an entry to the entry container
     * @param  {object} post - Reddit API t3 object
     */
    function add(post) {
        var entry = document.createElement("div");
        entry.className = "entry";

        entry.dataset["postId"] = post.id;
        entry.dataset["score"] = post.score;
        entry.dataset["downs"] = post.downs;
        entry.dataset["createdOn"] = post.created_utc;

        //We need to insert another layer to be able to clear flex layout
        var content = document.createElement("div");
        content.className = "content";
        
        content.appendChild(addThumbnail(post.thumbnail, post.url));
        content.appendChild(addTitle(post.title, loon.reddit.getThreadUrl(post.permalink)));
        
        entry.appendChild(content);
        container.appendChild(entry);
        return entry;
    }
    
    /**
     * Empties the entry container
     */
    function clear() {
        var content = document.getElementsByClassName("entry");
        while(content.length) {
            content[0].remove();
        }
    }

    /**
     * Adds all posts of an array to the entry container
     * @param  {array} posts - Array of Reddit API t3 objects
     */
    function addPostings(posts) {
        for(let i = 0; i < posts.length; i++) {
            add(posts[i].data);
        }
    }
    
    /**
     * Generates an html link that serves as a title
     * @param  {string} title - Displayed text
     * @param  {string} url - Link
     */
    function addTitle(title, url) {
        var text = document.createTextNode(title);
        text.className = "title";
        if(url) {
            var link = document.createElement("a");
            link.className = "comment_link";
            link.title = title;
            link.href = url;
            link.appendChild(text);
            return link;
        }
        return title;
    }
    
    /**
     * Generates a image element that is clickable
     * @param  {string} picture - Picture URL
     * @param  {string} url - Link
     */
    function addThumbnail(picture, url) {
        var thumbnail = document.createElement("img");
        var link = document.createElement("a");
        link.href = url;
        link.className = "picture_link";
        thumbnail.src = picture;
        thumbnail.className = "thumbnail";
        link.appendChild(thumbnail);
        return link;
    }
    
    /**
     * Initializes the context of this object
     */
    function init() {
        container = document.getElementById(ENTRY_CONTAINER);
    }
    
    //We wait for the DOM before initializing
    document.addEventListener("DOMContentLoaded", init, false);

    //Export as a module
    loon.entry = {
        add: add,
        addPostings: addPostings,
        clear: clear
    };
})(this.loon || (this.loon = {}));