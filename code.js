const urlBlogrollOpml = "https://feedland.social/opml?screenname=davewiner&catname=blogroll";

function goButtonClick () {
	const url = $(".inputForUrl").val ();
	location.href = "?url=" + encodeURIComponent (url);
	}
function readFeedList (urlOpml, callback) {
	function notComment (item) { //8/21/22 by DW
		return (!getBoolean (item.isComment));
		}
	function getUrlArrayFromOutline (theOutline) { //10/28/23 by DW
		var feedUrlList = new Array ();
		opml.visitAll (theOutline, function (node) {
			if (notComment (node)) {
				if (node.type == "rss") {
					if (node.xmlUrl !== undefined) {
						feedUrlList.push (node);
						}
					}
				}
			return (true); //keep visiting
			});
		return (feedUrlList);
		}
	readHttpFileThruProxy (urlOpml, undefined, function (opmltext) {
		if (opmltext === undefined) {
			const message = "Can't view the outline because there was an error reading the file.";
			callback ({message});
			}
		else {
			const theOutline = opml.parse (opmltext);
			const newlist = getUrlArrayFromOutline (theOutline);
			callback (undefined, newlist);
			}
		});
	}
function viewSubsList (theList, userOptions) {
	const options = {
		whereToAppend: $("body"),
		sortBy: "name",
		flReverseSort: false,
		maxTitleChars: 40,
		maxUrlChars: 40, //12/30/24 by DW
		title: undefined,
		opmlUrl: undefined
		};
	mergeOptions (userOptions, options);
	
	if ((options.title !== undefined) && (options.opmlUrl !== undefined)) {
		var pagetopHtml = "";
		function add (s) {
			pagetopHtml += s;
			}
		add ("<div class=\"divPagetopStuff\">")
		add ("<h3>" + options.title + "</h3>");
		add ("<div class=\"divInputAndButton\">");
		add ("<input class=\"inputForUrl\" value=\"" + options.opmlUrl + "\" placeholder=\"Address of OPML file\" type=\"text\" >");
		add ("<button onclick=\"goButtonClick ()\" class=\"btn\">Go</button>");
		add ("</div>");
		add ("</div>");
		options.whereToAppend.append (pagetopHtml);
		}
	
	const theTable = $("<table class=\"feedlistTable\"></table>");
	function sortTheList () {
		theList.sort (function (a, b) {
			switch (options.sortBy) {
				case "name":
					var alower = a.text.toLowerCase (), val;
					var blower = b.text.toLowerCase ();
					if (options.flReverseSort) { //7/11/22 by DW
						let tmp = alower;
						alower = blower;
						blower = tmp;
						}
					if (alower.length == 0) {
						return (1);
						}
					if (blower.length == 0) {
						return (-1);
						}
					if (alower == blower) {
						val = 0;
						}
					else {
						if (blower > alower) {
							val = -1;
							}
						else {
							val = 1;
							}
						}
					return (val);
				case "url":
					var alower = a.xmlUrl.toLowerCase (), val;
					var blower = b.xmlUrl.toLowerCase ();
					if (options.flReverseSort) { //7/11/22 by DW
						let tmp = alower;
						alower = blower;
						blower = tmp;
						}
					if (alower.length == 0) {
						return (1);
						}
					if (blower.length == 0) {
						return (-1);
						}
					if (alower == blower) {
						val = 0;
						}
					else {
						if (blower > alower) {
							val = -1;
							}
						else {
							val = 1;
							}
						}
					return (val);
				}
			});
		}
	function getColumnHeaders () {
		var theHeaders = $("<tr class=\"trHeaderRow\"></tr>");
		function getHeader (name, flRIght, flNotOnMobile=false) {
			var classes = "";
			if (flNotOnMobile) {
				classes = " notDisplayedOnMobile ";
				}
			if (flRIght) {
				classes += " tdRight ";
				}
			if (classes.length > 0) {
				classes = " class=\"" + classes + "\" ";
				}
			
			var nametext = name;
			if (stringLower (name) == options.sortBy) {
				nametext = "<b>" + nametext + "</b>";
				}
			const theHeader = $("<th" + classes + ">" + nametext + "</th>");
			theHeader.click (function () {
				console.log (name);
				var sortBy = stringLower (name);
				if (options.sortBy == sortBy) {
					options.flReverseSort = !options.flReverseSort;
					}
				else {
					options.sortBy = sortBy;
					options.flReverseSort = false;
					}
				
				sortTheList ();
				buildTable ();
				});
			return (theHeader);
			}
		$(theHeaders).append (getHeader ("Name"));
		$(theHeaders).append (getHeader ("URL"));
		return (theHeaders);
		}
	function buildTable () {
		theTable.empty ();
		theTable.append (getColumnHeaders ());
		theList.forEach (function (item) {
			const tr = $("<tr></tr>");
			function wrapInUrl (theText, url, maxChars=undefined) {
				if (url === undefined) {
					return (theText);
					}
				else {
					if (maxChars !== undefined) {
						theText = maxStringLength (theText, maxChars, false, true);
						}
					return ("<a href=\"" + item.htmlUrl + "\" target=\"_blank\">" + theText + "</a>");
					}
				}
			function getFeedTitle () {
				const td = $("<td class=\"tdFeedTitle\"></td>");
				var theText = wrapInUrl (item.text, item.htmlUrl, options.maxTitleChars);
				td.append (theText);
				return (td);
				}
			function getXmlUrl () {
				const td = $("<td class=\"tdXmlUrl\"></td>");
				const theText = wrapInUrl (item.xmlUrl, item.xmlUrl, options.maxUrlChars);
				td.append (theText);
				return (td);
				}
			tr.append (getFeedTitle ());
			tr.append (getXmlUrl ());
			theTable.append (tr);
			});
		}
	sortTheList ();
	buildTable ();
	options.whereToAppend.append (theTable);
	}

function startup () {
	console.log ("startup");
	
	function getUrlParam (name) { 
		var val = getURLParameter (name);
		if (val == "null") {
			return (undefined);
			}
		else {
			return (decodeURIComponent (val));
			}
		}
	var urlparam = getUrlParam ("url");
	
	if (urlparam == "https://feedland.social/opml") { //12/29/24 by DW
		location.href = "https://viewfeedlist.opml.org/?url=https%3A%2F%2Ffeedland.social%2Fopml%3Fscreenname%3Ddavewiner%26catname%3Dblogroll";
		}
	
	if (urlparam === undefined) {
		urlparam = urlBlogrollOpml;
		}
	readFeedList (urlparam, function (err, theList) {
		if (err) {
			alertDIalog (err.message);
			}
		else {
			const options = {
				opmlUrl: urlparam,
				title: "These are the feeds in this OPML file.",
				whereToAppend: $(".tableContainer")
				}
			viewSubsList (theList, options);
			hitCounter ();
			}
		});
	}
