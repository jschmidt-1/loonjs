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

    //Reddit URL...
    const REDDIT = "https://www.reddit.com";

    //Last loaded post
    var after = {};
    
    /**
     * Wrapper for reddit top post requests
     * @param  {string} subreddit - Name of the subreddit to query
     * @param  {object} options - Query string values
     */
    function subTop(subreddit, options) {
        return request(subreddit, "top", options).then(contentFilter);
    }

    /**
     * Wrapper for reddit new post requests
     * @param  {string} subreddit - Name of the subreddit to query
     * @param  {object} options - Query string values
     */
    function subNew(subreddit, options) {
        return request(subreddit, "new", options).then(contentFilter); 
    }

    /**
     * Wrapper for reddit hot post requests
     * @param  {string} subreddit - Name of the subreddit to query
     * @param  {object} options - Query string values
     */
    function subHot(subreddit, options) {
        return request(subreddit, "hot", options).then(contentFilter);
    }

    /**
     * Wrapper for reddit controversial post requests
     * @param  {string} subreddit - Name of the subreddit to query
     * @param  {object} options - Query string values
     */
    function subControversial(subreddit, options) {
        return request(subreddit, "controversial", options).then(contentFilter);
    }
    
    /**
     * Filter for reddit content
     * Reddit API does not expose advanced filters so we filter after fetching the data
     * This aims for non-NSFW picture posts or links that directly present an image
     * @param  {object} response - xhr response object
     */
    function contentFilter(response) {
        return response.data.children.filter(function(post) {
            var data = post.data;
            return !data.over_18
                && !data.stickied
                && !data.spoiler
                && data.thumbnail
                && data.thumbnail !== "default"
                && (data.post_hint === "link" || data.post_hint === "image");
        });      
    }
        
    /**
     * Internal request handler for the reddit CORS json API
     * @param  {string} subreddit - Name of the subreddit to query
     * @param  {string} category - Category name, e.g. "top"
     * @param  {object} options - Query string values
     */
    function request(subreddit, category, options) {
        //Main request handler
        function handler(resolve, reject) {
            function onError() {
                reject({
                    reason: xhr.statusText,
                    status: xhr.status
                });
            }

            function onLoad() {
                console.debug(xhr.response);
                //2xx Success
                if(this.status >= 200 && this.status < 300) {
                    after[subreddit] = xhr.response.data.after;
                    resolve(xhr.response);
                }
                else {
                    onError();
                }
            }

            var xhr = new XMLHttpRequest();
            xhr.open("GET", buildUrl(subreddit,category, options));
            xhr.responseType = "json"; 
            xhr.onload = onLoad;
            xhr.onerror = onError;
            xhr.send();
        }

        return new Promise(handler);
    }
    
    
    /**
     * Simple URL builder
     * Used for building xhr GET requests
     * @param  {string} subreddit - Name of the subreddit to query
     * @param  {string} category - Category name, e.g. "top"
     * @param  {object} options - Query string values
     */
    function buildUrl(subreddit, category, options) {
        var url = [REDDIT,"r",subreddit,category].join("/") + ".json";
        if(after[subreddit]) {
            options.after = after[subreddit];
        }
        else {
            after = {};
        }
        var query = [];
        for(let param in options) {
            if(options.hasOwnProperty(param)) {
                let v = encodeURIComponent(param) + "=" + encodeURIComponent(options[param]);
                query.push(v);
            }
        }
        if(query.length) {
            url += "?" + query.join("&");
        }
        return url;
    }

    
    /**
     * Used for retreiving the full URL for permalink URLs
     * @param  {string} url - permalink URL
     */
    function getThreadUrl(url) {
        return REDDIT + url;
    }

    //Export as a module
    loon.reddit = {
        hot: subHot,
        top: subTop,
        new: subNew,
        controversial: subControversial,
        getThreadUrl: getThreadUrl
    };
})(this.loon || (this.loon = {}));