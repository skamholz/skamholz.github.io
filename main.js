/* ToolPat - Main Application JavaScript */

var docCount = 0;
var totalDocCount = 0;
var docList = [];
var trialNo = "";
var po = "";
var pet = "";
var patNum = "";
var pdfLink = "";
var filingDate = "";
var lastModified = "";
var caseStatus = "";
var instDecisionDate = "";
var trialInfoObj = {};
var trialFromUrl = false;
var lastUpdate = "pending";
var updateStyle = "";
var trialNumber;
var patLinkCount = 0;

function popup(url) {
    var newwindow = window.open(url, 'name');
    if (window.focus && newwindow) { newwindow.focus(); }
}

function externalLinks() {
    if (!document.getElementsByTagName) return;
    var forms = document.getElementsByTagName("form");
    for (var i = 0; i < forms.length; i++) {
        if (forms[i].className.indexOf("external") !== -1) {
            forms[i].target = "_blank";
        }
    }
}

function patnumSearch() {
    var docnum = [];
    var patentquery = '';
    var pgpubquery = '';
    if (!document.combinednum || !document.combinednum.patnumquery) return;
    docnum = document.combinednum.patnumquery.value.split(' ');
    for (var i = 0; i < docnum.length; i++) {
        docnum[i] = rectifyPatNo(docnum[i]);
        if (docnum[i].length > 10) { pgpubquery += ' ' + docnum[i]; }
        else if (docnum[i].length > 0) { patentquery += ' ' + docnum[i]; }
    }
    if ((patentquery === '') && (pgpubquery === '')) {
        alert('Enter a list of patent numbers and/or PgPub numbers separated by spaces.');
        return;
    }
    if (patentquery !== '' && document.simplepatnumsearch) {
        document.simplepatnumsearch.TERM1.value = patentquery;
        document.simplepatnumsearch.submit();
    }
    if (pgpubquery !== '' && document.simplepgpubnumsearch) {
        document.simplepgpubnumsearch.TERM1.value = pgpubquery;
        document.simplepgpubnumsearch.submit();
    }
}

function patnumLink() {
    var docnum = [];
    if (!document.linktonum || !document.linktonum.patnumquery) return;
    docnum = document.linktonum.patnumquery.value.split(' ');
    for (var i = 0; i < docnum.length; i++) {
        var docLink;
        docnum[i] = rectifyPatNo(docnum[i]);
        if (docnum[i].length > 10) {
            docLink = "https://appft1.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&d=PG01&p=1&u=%2Fnetahtml%2FPTO%2Fsrchnum.html&r=1&f=G&l=50&s1=%22" + docnum[i] + "%22.PGNR.&OS=DN/" + docnum[i] + "&RS=DN/" + docnum[i];
        } else if (docnum[i].length > 0) {
            docLink = "http://patft1.uspto.gov/netacgi/nph-Parser?patentnumber=" + docnum[i];
        } else {
            continue;
        }
        window.open(docLink);
    }
}

function patpdf() {
    var docnum = [];
    if (!document.linktonum || !document.linktonum.patnumquery) return;
    docnum = document.linktonum.patnumquery.value.split(' ');
    for (var i = 0; i < docnum.length; i++) {
        var docLink;
        docnum[i] = rectifyPatNo(docnum[i]);
        if (!docnum[i]) continue;
        docLink = "https://www.freepatentsonline.com/" + docnum[i] + ".pdf";
        (function(targetLink) {
            var fpoFetch = new XMLHttpRequest();
            fpoFetch.onerror = function () { window.open(targetLink); };
            fpoFetch.open("GET", targetLink, true);
            fpoFetch.onreadystatechange = function () {
                if (fpoFetch.readyState === 4 && fpoFetch.status === 200) {
                    var fpoPage = fpoFetch.responseText;
                    var frameStart = fpoPage.indexOf("<iframe") + 13;
                    var frameEnd = fpoPage.indexOf("</iframe") - 52;
                    var patentLink = fpoPage.substring(frameStart, frameEnd) + "#zoom=150";
                    window.open(patentLink);
                }
            };
            fpoFetch.send();
        })(docLink);
    }
}

function patpdfLink(patnum) {
    var fpoLink = "https://www.freepatentsonline.com/" + patnum + ".pdf";
    var fpoFetch = new XMLHttpRequest();
    var patentLink = fpoLink;
    fpoFetch.open("GET", fpoLink, false);
    fpoFetch.onreadystatechange = function () {
        if (fpoFetch.readyState === 4 && fpoFetch.status === 200) {
            var fpoPage = fpoFetch.responseText;
            var frameStart = fpoPage.indexOf("<iframe") + 13;
            var frameEnd = fpoPage.indexOf("</iframe") - 52;
            patentLink = fpoPage.substring(frameStart, frameEnd) + "#zoom=150";
        }
    };
    fpoFetch.send();
    return patentLink;
}

function oldpatnumLink() {
    if (!document.linktonum || !document.linktonum.patnumquery) return;
    var docnum = rectifyPatNo(document.linktonum.patnumquery.value);
    var docLink = "";
    if (docnum.length > 10) {
        docLink = "http://appft1.uspto.gov/netacgi/nph-Parser?Sect1=PTO2&Sect2=HITOFF&p=1&u=%2Fnetahtml%2FPTO%2Fsearch-adv.html&r=1&f=G&l=50&d=PG01&S1=" + docnum;
    } else {
        docLink = "http://patft1.uspto.gov/netacgi/nph-Parser?patentnumber=" + docnum;
    }
    alert(docLink);
    window.open(docLink);
}

function configAssign() {
    if (!document.assign || !document.assign.submission) return false;
    var assignaction = "https://assignment.uspto.gov/patent/index.html#/patent/search/resultAbstract?type=";
    document.assign.submission.value = rectifyPatNo(document.assign.submission.value);
    if (document.assign.submission.value.length > 10) {
        assignaction += "&pub=" + document.assign.submission.value;
    } else {
        assignaction += "patNum&id=" + document.assign.submission.value;
    }
    var newwindow = window.open(assignaction, '_blank');
    if (window.focus && newwindow) { newwindow.focus(); }
    return false;
}

function rectifyPatNo(patno) {
    patno = patno.toUpperCase();
    patno = patno.replace(/\/|-|,| |US|[A-B][0-9]/ig, ""); // eliminate forward slash, hyphen, comma, space, 'US' and kind code
    if (patno.match(/^H/)) {
        while (patno.length < 7) { patno = 'H0' + patno.substr(1); } // add leading zeros to SIR numbers
    }
    return patno;
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function init() {
    if (init.done) return;
    init.done = true;

    externalLinks();

    var inputElements = document.getElementsByTagName('input');
    for (var i = 0; inputElements[i]; i++) {
        inputElements[i].setAttribute('autocomplete', 'on');
    }

    var trialNoEl = document.getElementById('trialNo');
    if (trialNoEl) {
        trialNoEl.addEventListener('keyup', function (event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                var getDocket = document.getElementById('getDocket');
                if (getDocket) getDocket.click();
            }
        });
    }

    // Banner close button
    var closeBannerBtn = document.querySelector('.close-banner-btn');
    if (closeBannerBtn) {
        closeBannerBtn.addEventListener('click', function() {
            var banner = document.getElementById('topAnnouncement');
            if (banner) banner.style.display = 'none';
        });
    }

    // Linktonum form
    var linkForm = document.forms['linktonum'];
    if (linkForm) {
        linkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            patnumLink();
        });
        var pdfBtn = linkForm.querySelector('input[type="button"][value="PDF"]');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', function(e) {
                e.preventDefault();
                patpdf();
            });
        }
    }

    // Patsearch form
    var patSearchForm = document.forms['patsearch'];
    if (patSearchForm) {
        patSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
        });
        var patBtn = patSearchForm.querySelector('input[value="Patent"]');
        if (patBtn) {
            patBtn.addEventListener('click', function() {
                patSearchForm.action = 'http://patft.uspto.gov/netacgi/nph-Parser';
                if (patSearchForm.d) patSearchForm.d.value = 'pall';
                patSearchForm.submit();
            });
        }
        var pgpubBtn = patSearchForm.querySelector('input[value="PGPub"]');
        if (pgpubBtn) {
            pgpubBtn.addEventListener('click', function() {
                patSearchForm.action = 'http://appft1.uspto.gov/netacgi/nph-Parser';
                if (patSearchForm.d) patSearchForm.d.value = 'PG01';
                patSearchForm.submit();
            });
        }
    }

    // Assign form
    var assignForm = document.forms['assign'];
    if (assignForm) {
        assignForm.addEventListener('submit', function(e) {
            e.preventDefault();
            configAssign();
        });
    }

    // ToolPat container button
    var toolpatBtns = document.querySelectorAll('.toolpat-container');
    toolpatBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            location.href = 'https://plus.toolpat.com';
        });
        btn.addEventListener('mouseenter', function() {
            btn.style.filter = 'brightness(85%)';
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.filter = 'none';
            btn.style.backgroundColor = '';
        });
        btn.addEventListener('mousedown', function() {
            btn.style.filter = 'none';
            btn.classList.add('toolpatredbg');
            btn.style.backgroundColor = 'var(--btn-bg)';
            btn.style.transform = 'translate(2px, 2px)';
            btn.style.boxShadow = '0px 0px 0px rgba(0,0,0,0)';
        });
        btn.addEventListener('mouseup', function() {
            btn.classList.remove('toolpatredbg');
            btn.style.backgroundColor = '';
            btn.style.filter = 'brightness(85%)';
            btn.style.transform = 'none';
            btn.style.boxShadow = '2px 2px 0px rgba(0,0,0,0.2)';
        });
    });

    // PCT search
    var pctSearch = document.getElementById('pctsearch');
    var pctButton = document.getElementById('pctbutton');
    if (pctSearch && pctButton) {
        pctSearch.addEventListener('keyup', function(e) {
            if (e.keyCode === 13) {
                pctButton.click();
            }
        });
        pctButton.addEventListener('click', function() {
            var val = pctSearch.value.replace(/\//g, '').toUpperCase();
            window.open('https://patentscope.wipo.int/search/en/detail.jsf?docId=' + val);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
