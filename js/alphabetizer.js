
//core features
var alphabetizeOn = true;
var instantEntry = true;

//secondary features
var activeEntry = false;
var multiEntry = false;

var deleteOnClick = false;
var shuffleData = false;
var clearData = false;

//User Interface
var showOptions = true;
var forceHideOptions = false;
var forceShowOptions = false;
var showIndex = false;


//unsupported features
var spaceSplit = false;
var savedItems = false;


// Used variables
var inputHtmlLocation = '.css-input';
var listContainerHtmlLocation = '.items';
var listHtmlLocation = '.list';
var indexContainerHtmlLocation = '.index'
var itemsInArray = 0;
var mostRecentItem;
var mostRecentItemPosition;
var mininumPositionsFromTop = 2;
var positionsToSubtract = 2;

// Magical array where everything takes place
var items = [];


//code used for shuffling arrays
//from here http://stackoverflow.com/a/12646864
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

///check if there are stored items from a previous session and load them into items
//not currently used
//var replaceSavedItems = function(){
//	if (savedItems === true) {
//		items = savedItems;
//	};
//};


//display items according to preset options
//This function is the "display engine"
//some alphabetization code repurposed from
//http://stackoverflow.com/a/25431980
//http://stackoverflow.com/a/9645447
var displayItems = function() {

    var $list = $(listHtmlLocation);                                         //the list will will be placed & displayed in .list


    // This is where the options/features list starts
	if (alphabetizeOn === true) {                                   //if alphabetize is on
		items.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());  //sort items independent of case
        });                                                         

        $('.alphabet-box').prop( 'checked', true );                 //make sure the option box is checked
	};

	if (shuffleData === true ) {                                    //if shuffle is on
        alphabetizeOn = false;                                      //turn off auto-alphabetize
		shuffleArray(items);				                        //shuffle data
        $('.alphabet-box').prop( 'checked', false );                //uncheck alphabetize
        $('.shuffle-box').prop( 'checked', true );                  //check shuffle box
	};
    if (shuffleData === false) {                                    //if shuffle is off
        $('.shuffle-box').prop( 'checked', false );                 //uncheck shuffle box
    };

	//if (multiEntry === true) {
		//only fires if it's true from the start, not if it's fired by key recognition
	//}

	if (deleteOnClick === true) {                                   //if deletable is on
		$list.addClass("deletable");                                //make things appear deletable
		deleteFunction();                                           //run the delete function
	};
    if (deleteOnClick === false) {                                  //if deletable is on
        $list.removeClass("deletable").unbind('click');             //make things appear deletable, unbind jquery's onclick fron .deleteable
        deleteFunction();                                           //run the delete function
    };

    // start making the list

    $list.html('');                                                 // clear the previous contents of .list

    $.each(items, function (indexPosition) {                        // iterate through the list
        $list.append('<li class="' + indexPosition + '">' + this + '</li>'); // append a list item for each
    });

    // highlite active entry** -note to self, learn how to actually spell highlite 
    mostRecentItemPosition = items.indexOf(mostRecentItem);             // sets most recent item position so that it can be highlited in list
    if (activeEntry === true) {                                         // if active entry is on
        $(listHtmlLocation + ' .' + mostRecentItemPosition).addClass('active');  // make active item visible
    };


    //start scrolling the list to current item

    var scrollToPosition = mostRecentItemPosition;                          // set the target to scroll to

    if (scrollToPosition >= mininumPositionsFromTop) {                      // if the item's (2) or more down from the top
        scrollToPosition = mostRecentItemPosition - positionsToSubtract;    // subtract (2) positions to give context
    }
    else{                                                                   // otherwise (if there's less than (2) items above it)
        scrollToPosition = 0;                                                // make the scroll target the top
    };

    if (items.length > 0) {                                         // as long is there is more than 0 items in the list
        scrolling(listContainerHtmlLocation,scrollToPosition);
    };

    //$(listContainerHtmlLocation).scrollTop($('li.' + scrollToPosition).position().top);  // scroll to most recent item non-animated
};

var scrolling = function(containerToScroll,itemNumberToScrollTo){
        $(containerToScroll).stop(true, true).animate({
            scrollTop: $('li.' + itemNumberToScrollTo).position().top   // Animate scroll to item top
        }, 500);                 
}


var fireMultiEntryMode = function(modeSwitch){
    if (modeSwitch === 'enterMode'){
        $(inputHtmlLocation).addClass('multi-entry');       // Activate multi-entry mode
        $('.hint-box').removeClass('default');              // de-ctivate default hint
        $('.hint-box').addClass('multi');                   // Activate multi-entry hint
        multiEntry = true;                                  // switch multi entry on
        instantEntry = false;                               // turn off instant entry        
    };
    if (modeSwitch === 'leaveMode') {
        $(inputHtmlLocation).removeClass('multi-entry');    // de-activate multi-entry mode
        $('.hint-box').removeClass('multi');                // de-activate multi-entry hint
        $('.hint-box').addClass('default');                 // activate default hint
        multiEntry = false;                                 // switch it off
        instantEntry = true;                                 // swich back to instant mode
        changeListLength();
    };
};


//grab items from input
//This segment listens to and manipulates the input box... and does some stuff with what it grabs
/*
How it works:
Im typing > each keyup fires logic > if I haven't hit enter yet, I want the item to be deleted every time
If I have hit enter > I want the item to be added to the array
items in array keeps track of number of permanent items
*/
$(inputHtmlLocation).on('keyup', function (event) {     // listen to each keypress in the input box

    if (itemsInArray < items.length) {                  // if (permanent) items in array is less than the current # of items
        if (items.length >= 0) {                        // and if there are items there
            items.splice(mostRecentItemPosition, 1);    // delete the last thing that was put in
            itemsInArray = items.length;                // reset the number of items (just in case)
            //console.log('removed: ' + mostRecentItem + ' from: ' + mostRecentItemPosition); //
        };
    };

    var $input = $(event.target);                       // set $input as the source of all of this
    var item = $input.val();                            // take the value of the input box 
    var itemTrimmed = item.trim();                      // trim leading and following white space

    mostRecentItem = itemTrimmed;                       //set most recent item globally
    activeEntry = true;                                 // set active to on


    // special cases for certain keys/combos
    //Shift-enter & ctrl-v

    if (event.which === 13 && event.shiftKey || event.which === 86 && (event.ctrlKey || event.metakey)) {     // if shift and enter or ctrl v are pressed
        fireMultiEntryMode('enterMode');                    // launch multi-entry mode
    }
    //escape
    if (event.which === 27) {                               // if escape is pressed
        fireMultiEntryMode('leaveMode');                    // exit multi-entry mode
        $input.val('');                                     // clear the input box completely
    }

    //adding items to the array
    //with multi-entry
    if (multiEntry === true) {                                  // if multi-entry is active
        if (event.which === 13 && !event.shiftKey) {            // if enter is pressed
            var itemsSplit = itemTrimmed.split(/\r\n|\r|\n/g);  // split at each line break
            $.merge(items, itemsSplit);                         // add split items to array
            $input.val(' ');                                    // empty the input (space prevents placeholder text from displaying)
            itemsInArray = itemsInArray + itemsSplit.length;    // increase the "official" item count
            itemsSplit.length = 0;                              // empty 
            changeListLength();                                 // update heights for scrolling the index
        };
    } else {                                                    //  for everything else
        var itemsSplit = itemTrimmed.split(/\r\n|\r|\n/g);      // split at each line break
        if (itemsSplit.length > 1){                             // if there's more than one thing being added it's actually a multi-entry
            fireMultiEntryMode('enterMode');                    // enter multi-entry mode
            return                                              //get out of here, it's a trap!
        }
        $.merge(items, itemsSplit);                             // add split items to array
        //  items.push(itemTrimmed);// just add trimed items
    }

    //when enter is pressed
    if ( (event.which === 13 || event.which === 10) && !event.shiftKey) {           // if enter(or line feed) is pressed
        $input.val(' ');                                                            // empty the input (space prevents placeholder text from displaying)
        //console.log('enter');
        itemsInArray = itemsInArray + itemsSplit.length;                            // increase the "official" item count
        itemsSplit.length = 0;                                                      // empty
        $(listHtmlLocation + ' .' + mostRecentItemPosition).removeClass('active');  // remove active class from now inactive item
        changeListLength();                                                         // update heights for scrolling the index
        activeEntry = false;                                                        // set active to off
    };
    
    displayItems();                                         // display all of the items

});

//this stops a new line from appearing in the input box
$(inputHtmlLocation).on('keydown', function (event) {       // listen to each keydown in the input box
    if (event.which === 13 && !event.shiftKey) {            // if it's enter & not shift enter
        event.preventDefault();                             // stop enter from being entered
    };
});


var deleteFunction = function(){
//delete items from array
    if (deleteOnClick === true) {
        $('.deletable').on('click', 'li', function () {     // on clicking a list item
            var arrayPosition = $(this).attr('class');      // grab the array position from the class
            items[arrayPosition] = " ";                     // replace it with a blank space
            $(this).addClass('inert');                      // make it look inert
            var notQuiteThis = this;                        // hold reference for fadeout animation
            var makeItDisappear = function(){               // animated hide of element
                $(notQuiteThis).fadeOut({ duration: 300, queue: false });
                $(notQuiteThis).animate({right:100},600);
            };
            setTimeout(makeItDisappear, 600);               //delay animation 600ms
            
            //$(this).append(' <span class=\"undo\">undo</a>');// add undo link
        });
    }
};

//options Checkbox actions
$(".deletable-box").change(function() {     // if deletable is toggled
    if(this.checked) {                      // on
        deleteOnClick = true;               // switch deletable on
    }
    else{                                   // off
        deleteOnClick = false;              // switch deletable off
    }
    displayItems();                         // display items
});
$(".alphabet-box").change(function() {      // if alphabetize is toggled
    if(this.checked) {                      // on
        alphabetizeOn = true;               // switch alphabetize on
        shuffleData = false;                // switch shuffle off
    }
    else{                                   // off
        alphabetizeOn = false;              // switch alphabetize off
    }
    displayItems();                         // display items
});
$(".shuffle-box").change(function() {       // if shuffle is toggled
    if(this.checked) {                      // on
        shuffleData = true;                 // switch shuffle on
        alphabetizeOn = false;              // switch alphabetize off
    }
    else{                                   // off
        shuffleData = false;                // switch shuffle off
    }
    displayItems();                         // display items
});
$(".clear-button").click(function(){        // if clear button is clicked
    items.length = 0;                       // clear all data in items array
    itemsInArray = 0;                       // reset itemsInArray variable
    $(inputHtmlLocation).val('');           // empty the input
    changeListLength();                     // update heights for scrolling the index
    displayItems();                         // display items
});



// options dropdown
var scrollOptions = function(chosenClass){
      if ( ( $('.' + chosenClass + ' .options-head .arrow').hasClass('unpressed') || forceShowOptions) && !forceHideOptions ) {       // if the arrow was unpressed or options are forced
        $('.' + chosenClass + ' .options-head .arrow').removeClass('unpressed');        // remove the unpressed class
        $('.' + chosenClass + ' .options-head .arrow').addClass('pressed');             // add the pressed class
        $('.' + chosenClass + ' .options-head').removeClass('inert');                   // remove the inert(unused) class
        $('.' + chosenClass + ' .options').stop(true, true).slideDown();                // slide down the options
        showOptions = true;                                                             // toggle them as shown
        forceShowOptions = false;
      }
      else {                                                                        // otherwise (if the arrow was pressed)
        $('.' + chosenClass + ' .options-head .arrow').removeClass('pressed');      // remove pressed class
        $('.' + chosenClass + ' .options-head .arrow').addClass('unpressed');       // add unpressed class
        $('.' + chosenClass + ' .options-head').addClass('inert');                  // add inert class
        $('.' + chosenClass + ' .options').stop(true, true).slideUp();              // slide the options away
        showOptions = false;                                                        // toggle them as hidden
        forceHideOptions = false;                                                   // turn force hide off
      };
    //alert(' options have been toggled and chosenClass=' + chosenClass + 'scroll: ' + $(window).scrollTop() + ' thinDisplay: ' + thinDisplay + ' showOptions: ' + showOptions);
};

$('.options-container .options-head').click(function () {                           // when the options header is clicked
    scrollOptions('options-container');                                             // slide options
});
$('.options-container-mobile .options-head').click(function () {                    // when the options header is clicked
    scrollOptions('options-container-mobile');                                      // slide options
});


// index dropdown (similar to options)
/** not currently in use
    $('.index-head').click(function () {
      if ($(".index-head .arrow").hasClass('unpressed')) {
        $(".index-head .arrow").removeClass("unpressed");
        $(".index-head .arrow").addClass("pressed");
        $(".index-head").removeClass("inert");
        $( ".alphabet").stop(true, true).slideDown();
        showIndex = true;
      }
      else {
        $(".index-head .arrow").removeClass("pressed");
        $(".index-head").addClass("inert");
        $(".index-head .arrow").addClass("unpressed");
        $( ".alphabet" ).stop(true, true).slideUp();
        showIndex = false;
      };
    });
*/

///responsiveness code
var windowHeight = $(window).height();                                                  // grab window height
var windowWidth = $(window).width();                                                    // grab window width
var mobileOptionsHeight = $('.options-container-mobile .options-head').height() + 10;   // grab height of the mobile options(closed + 5 padding + 5 margin)
var headerHeight = $('.row.first').height();                                            // grab height of the header
var topBorderHeight = $('.top-border').height();                                        // grab height of that top bordery thing
var footerHeight = $('footer').height();                                                // grab height of the footer
var itemsHeight = windowHeight - (headerHeight + topBorderHeight + footerHeight);       // calculate available height for the items
var mobileItemsHeight = itemsHeight - mobileOptionsHeight;

var shortDisplayHeight = 500;                                       // set the threshold for short display - note to self learn how to spell threshold
var shortDisplay = false;                                           // short display mode?
var thinDisplayWidth = "64.063em";                                  // set threshold for non-desktop media query
var thinDisplay = Modernizr.mq('(max-width: ' + thinDisplayWidth +')'); // check if it's thinDisplay with modernizr.mq                                                    // thin display mode?
var wasThinDisplay;                                                 // hold previous value of thinDisplay here


if (thinDisplay === true) {     // if the media query for non-desktop width is hit on initial page load
    showOptions = false;        // show options is set to false
};


// function which controls javascript based responsiveness
// called on load and on window resize
var responsiveWindow = function(){
    
    wasThinDisplay = thinDisplay;                                           // hold the previous value of thinDisplay
    thinDisplay = Modernizr.mq('(max-width: ' + thinDisplayWidth +')');     // check if it is thinDisplay

    if (windowHeight < shortDisplayHeight) {    // if the window is lower than the threshold for short display
        shortDisplay = true;                    // set it into short mode
        positionsToSubtract = 1;                // set scroll to position to 0 (places the most recent item at the very top) 
    }
    else{                                       // otherwise
        shortDisplay = false;                   // keep it in tall mode
        positionsToSubtract = 2;                // set scroll To Position back to 2
    };

    if (thinDisplay === true) {                                                         // if mobile width
        $(listContainerHtmlLocation).css('max-height', mobileItemsHeight + 'px');       // set the height of items to take into account the options at the top
        //$(indexContainerHtmlLocation).css('max-height', mobileItemsHeight + 'px');       // set the height of items to take into account the options at the top
    }
    else{                                                                               // otherwise
        $(listContainerHtmlLocation).css('max-height', itemsHeight + 'px');             // set the height of items accordingly
        //$(indexContainerHtmlLocation).css('max-height', itemsHeight + 'px');             // set the height of items accordingly
    }


    if (thinDisplay === false && wasThinDisplay === true){      // if coming from mobile size to desktop size
        showOptions = true;                                     // set show options on
        forceShowOptions =  true;                               // force show
        scrollOptions('options-container');                     // the desktop options
    }

    if (thinDisplay === true && wasThinDisplay === false ) {    // if coming from desktop size to mobile size 
        showOptions = false;                                    // set options off
        forceHideOptions = true;                                // force hide
        scrollOptions('options-container-mobile');              // the mobile options

    };

};



$(window).resize(function() {                                                           // on window resize
    windowHeight = $(window).height();                                                  // reset window height 
    windowWidth = $(window).width();                                                    // reset window width
    mobileOptionsHeight = $('.options-container-mobile .options-head').height() + 10;   // grab height of the mobile options(closed + 5 padding + 5 margin)
    headerHeight = $('.row.first').height();                                            // grab height of the header
    topBorderHeight = $('.top-border').height();                                        // grab the height of that top divider thing
    footerHeight = $('footer').height();                                                // grab height of the footer
    itemsHeight = windowHeight - (headerHeight + topBorderHeight + footerHeight);       // calculate available height for the items
    mobileItemsHeight = itemsHeight - mobileOptionsHeight;                              // calculate available including top options

    responsiveWindow();                                             // re-run the responsive function
});


responsiveWindow();         // run the responsive function




//scroll functions
//this should slide options up if you're on mobile and scroll down
//scroll code adapted from http://stackoverflow.com/a/7392655/1973361

var scrollTimer = null;
$(window).scroll(function () {
    if (scrollTimer) {
        clearTimeout(scrollTimer);                  // clear any previous pending timer
    }
    scrollTimer = setTimeout(handleScroll, 100);    // set new timer
});

function handleScroll() {
    scrollTimer = null;
    if (thinDisplay === true && $(window).scrollTop() > 0 && showOptions === true ) {   // if thinDisplay is on and showOptions is true and scrollTop is greater than 0    
        forceHideOptions = true;
        scrollOptions('options-container-mobile');                                      //hide the options
    };
}

var itemsScrollTop;
var itemsScrollBottom;
var alphabetScrollTop;
var alphabetScrollBottom;
var itemsInnerHeight;
var itemsViewRatio;
var alphabetInnerHeight;
var indexHighlighter = $('.highlighter.active');


var changeListLength = function(){
    itemsInnerHeight = $(listHtmlLocation).height();
    alphabetInnerHeight = $('.alphabet').height();
    indexHeight = $('.index').height();
    itemsViewRatio = itemsHeight / itemsInnerHeight;
    //indexHighlighterHeight = itemsViewRatio * alphabetInnerHeight;
    indexHighlighterHeight = $('.alphabet .index0').height();
    indexHighlighter.css('height', indexHighlighterHeight);       // set the height of items to take into account the options at the top

};



//linking up the index
$('.items').on('scroll', function () {
    itemsScrollTop = $(this).scrollTop();
    itemsScrollBottom = itemsScrollTop - itemsHeight; 


    //var scrollBottom = $(window).scrollTop() + $(window).height();
    //itemsScrollValue / itemsInnerHeight = x / alphabetInnerHeight

    alphabetScrollTop = ( itemsScrollTop / itemsInnerHeight ) * alphabetInnerHeight; 
    alphabetScrollBottom = alphabetScrollTop - indexHeight;

    //$('.index').scrollTop(alphabetScrollTop); //alphabet scroll top
    //indexHighlighter.css('top', alphabetScrollTop);       // set the height of items to take into account the options at the top
    scrollingItems();
});


/*
Array is divided up by letter and then the first entry is grabbed
Array is then searched for first entry and then that is stored
*/

items = ["-ish suffix ", "-sized ", "a bit ", "a couple ", "a few ", "a little det., pron. ", "a, an indefinite article ", "a.m. (NAmE also A.M.) abbr. ", "abandon v. ", "abandoned adj. ", "ability n. ", "able adj. ", "about adv., prep. ", "above prep., adv. ", "abroad adv. ", "absence n. ", "absent adj. ", "absolute adj. ", "absolutely adv. ", "absorb v. ", "abuse n., v. ", "academic adj. ", "accent n. ", "accept v. ", "acceptable adj. ", "access n. ", "accident n. ", "accidental adj. ", "accidentally adv. ", "accommodation n. ", "accompany v. ", "according to prep. ", "account n., v. ", "accurate adj. ", "accurately adv. ", "accuse v. ", "achieve v. ", "achievement n. ", "acid n. ", "acknowledge v. ", "acquire v. ", "across adv., prep. ", "act n., v. ", "action n. ", "active adj. ", "actively adv. ", "activity n. ", "actor, actress n. ", "actual adj. ", "actually adv. ", "ad  advertisement ", "adapt v. ", "add v. ", "addition n. ", "additional adj. ", "address n., v. ", "adequate adj. ", "adequately adv. ", "adjust v. ", "admiration n. ", "admire v. ", "admit v. ", "adopt v. ", "adult n., adj. ", "advance n., v. ", "advanced adj. ", "advantage n. ", "adventure n. ", "advertise v. ", "advertisement (also ad, advert) n. ", "advertising n. ", "advice n. ", "advise v. ", "affair n. ", "affect v. ", "affection n. ", "afford v. ", "afraid adj. ", "after prep., conj., adv. ", "afternoon n. ", "afterwards (especially BrE; NAmE usually afterward) adv. ", "again adv. ", "against prep. ", "age n. ", "aged adj. ", "agency n. ", "agent n. ", "aggressive adj. ", "ago adv. ", "agree v. ", "agreement n. ", "ahead adv. ", "aid n., v. ", "aim n., v. ", "air n. ", "aircraft n. ", "airport n. ", "alarm n., v. ", "alarmed adj. ", "alarming adj. ", "alcohol n. ", "alcoholic adj., n. ", "alive adj. ", "all det., pron., adv. ", "all right adj., adv., exclamation ", "allied adj. ", "allow v. ", "ally n., v. ", "almost adv. ", "alone adj., adv. ", "along prep., adv. ", "alongside prep., adv. ", "aloud adv. ", "alphabet n. ", "alphabetical adj. ", "alphabetically adv. ", "already adv. ", "also adv. ", "alter v. ", "alternative n., adj. ", "alternatively adv. ", "although conj. ", "altogether adv. ", "always adv. ", "amaze v. ", "amazed adj. ", "amazing adj. ", "ambition n. ", "ambulance n. ", "among (also amongst) prep. ", "amount n., v. ", "amuse v. ", "amused adj. ", "amusing adj. ", "an  a, an ", "analyse (BrE) (NAmE analyze) v. ", "analysis n. ", "ancient adj. ", "and conj. ", "anger n. ", "angle n. ", "angrily adv. ", "angry adj. ", "animal n. ", "ankle n. ", "anniversary n. ", "announce v. ", "annoy v. ", "annoyed adj. ", "annoying adj. ", "annual adj. ", "annually adv. ", "another det., pron. ", "answer n., v. ", "anti- prefix ", "anticipate v. ", "anxiety n. ", "anxious adj. ", "anxiously adv. ", "any det., pron., adv. ", "anyone (also anybody) pron. ", "anything pron. ", "anyway adv. ", "anywhere adv. ", "apart adv. ", "apart from (also aside from especially in NAmE) prep. ", "apartment n. (especially NAmE) ", "apologize (BrE also -ise) v. ", "apparent adj. ", "apparently adv. ", "appeal n., v. ", "appear v. ", "appearance n. ", "apple n. ", "application n. ", "apply v. ", "appoint v. ", "appointment n. ", "appreciate v. ", "approach v., n. ", "appropriate adj. ", "approval n. ", "approve (of) v. ", "approving adj. ", "approximate adj. ", "approximately adv. ", "April n. (abbr. Apr.) ", "area n. ", "argue v. ", "argument n. ", "arise v. ", "arm n., v. ", "armed adj. ", "arms n. ", "army n. ", "around adv., prep. ", "arrange v. ", "arrangement n. ", "arrest v., n. ", "arrival n. ", "arrive v. ", "arrow n. ", "art n. ", "article n. ", "artificial adj. ", "artificially adv. ", "artist n. ", "artistic adj. ", "as prep., adv., conj. ", "as soon as ", "as well (as) ", "ashamed adj. ", "aside adv. ", "aside from  apart from ", "ask v. ", "asleep adj. ", "aspect n. ", "assist v. ", "assistance n. ", "assistant n., adj. ", "associate v. ", "associated with ", "association n. ", "assume v. ", "assure v. ", "at first ", "at least ", "at prep. ", "atmosphere n. ", "atom n. ", "attach v. ", "attached adj. ", "attack n., v. ", "attempt n., v. ", "attempted adj. ", "attend v. ", "attention n. ", "attitude n. ", "attorney n. (especially NAmE) ", "attract v. ", "attraction n. ", "attractive adj. ", "audience n. ", "August n. (abbr. Aug.) ", "aunt n. ", "author n. ", "authority n. ", "automatic adj. ", "automatically adv. ", "autumn n. (especially BrE) ", "available adj. ", "average adj., n. ", "avoid v. ", "awake adj. ", "award n., v. ", "aware adj. ", "away adv. ", "awful adj. ", "awfully adv. ", "awkward adj. ", "awkwardly adv. ", "baby n. ", "back n., adj., adv., v. ", "background n. ", "backward adj. ", "backwards (also backward especially in NAmE) adv. ", "bacteria n. ", "bad adj. ", "bad-tempered adj. ", "badly adv. ", "bag n. ", "baggage n. (especially NAmE) ", "bake v. ", "balance n., v. ", "ball n. ", "ban v., n. ", "band n. ", "bandage n., v. ", "bank n. ", "bar n. ", "bargain n. ", "barrier n. ", "base n., v. ", "based on ", "basic adj. ", "basically adv. ", "basis n. ", "bath n. ", "bathroom n. ", "battery n. ", "battle n. ", "bay n. ", "be called ", "be going to ", "be sick (BrE) ", "be v., auxiliary v. ", "beach n. ", "beak n. ", "bear v. ", "beard n. ", "beat n., v. ", "beautiful adj. ", "beautifully adv. ", "beauty n. ", "because conj. ", "because of prep. ", "become v. ", "bed n. ", "bedroom n. ", "beef n. ", "beer n. ", "before prep., conj., adv. ", "begin v. ", "beginning n. ", "behalf n.: on behalf of sb, on sb’s behalf (BrE) (NAmE in behalf of sb, in sb’s behalf) ", "behave v. ", "behaviour (BrE) (NAmE behavior) n. ", "behind prep., adv. ", "belief n. ", "believe v. ", "bell n. ", "belong v. ", "below prep., adv. ", "belt n. ", "bend v., n. ", "beneath prep., adv. ", "benefit n., v. ", "bent adj. ", "beside prep. ", "bet v., n. ", "better, best  good, well ", "betting n. ", "between prep., adv. ", "beyond prep., adv. ", "bicycle (also bike) n. ", "bid v., n. ", "big adj. ", "bill n. ", "bin n. (BrE) ", "biology n. ", "bird n. ", "birth n. ", "birthday n. ", "biscuit n. (BrE) ", "bit n. (especially BrE) ", "bite v., n. ", "bitter adj. ", "bitterly adv. ", "black adj., n. ", "blade n. ", "blame v., n. ", "blank adj., n. ", "blankly adv. ", "blind adj. ", "block n., v. ", "blonde adj., n., blond adj. ", "blood n. ", "blow v., n. ", "blue adj., n. ", "board n., v. ", "boat n. ", "body n. ", "boil v. ", "bomb n., v. ", "bone n. ", "book n., v. ", "boot n. ", "border n. ", "bore v. ", "bored adj. ", "boring adj. ", "born: be born v. ", "borrow v. ", "boss n. ", "both det., pron. ", "bother v. ", "bottle n. ", "bottom n., adj. ", "bound adj.: bound to ", "bowl n. ", "box n. ", "boy n. ", "boyfriend n. ", "brain n. ", "branch n. ", "brand n. ", "brave adj. ", "bread n. ", "break v., n. ", "breakfast n. ", "breast n. ", "breath n. ", "breathe v. ", "breathing n. ", "breed v., n. ", "brick n. ", "bridge n. ", "brief adj. ", "briefly adv. ", "bright adj. ", "brightly adv. ", "brilliant adj. ", "bring v. ", "broad adj. ", "broadcast v., n. ", "broadly adv. ", "broken  break ", "broken adj. ", "brother n. ", "brown adj., n. ", "brush n., v. ", "bubble n. ", "budget n. ", "build v. ", "building n. ", "bullet n. ", "bunch n. ", "burn v. ", "burnt adj. ", "burst v. ", "bury v. ", "bus n. ", "bush n. ", "business n. ", "businessman, businesswoman n. ", "busy adj. ", "but conj. ", "butter n. ", "button n. ", "buy v. ", "buyer n. ", "by accident ", "by means of ", "by prep., adv. ", "bye exclamation ", "c abbr.  cent ", "cabinet n. ", "cable n. ", "cake n. ", "calculate v. ", "calculation n. ", "call v., n. ", "calm adj., v., n. ", "calmly adv. ", "camera n. ", "camp n., v. ", "campaign n. ", "camping n. ", "can modal v., n. ", "cancel v. ", "cancer n. ", "candidate n. ", "candy n. (NAmE) ", "cannot ", "cap n. ", "capable (of) adj. ", "capacity n. ", "capital n., adj. ", "captain n. ", "capture v., n. ", "car n. ", "card n. ", "cardboard n. ", "care for ", "care n., v. ", "career n. ", "careful adj. ", "carefully adv. ", "careless adj. ", "carelessly adv. ", "carpet n. ", "carrot n. ", "carry v. ", "case n. ", "cash n. ", "cast v., n. ", "castle n. ", "cat n. ", "catch v. ", "category n. ", "cause n., v. ", "CD n. ", "cease v. ", "ceiling n. ", "celebrate v. ", "celebration n. ", "cell n. ", "cellphone (also cellular phone) n. (especially NAmE) ", "cent n. (abbr. c, ct) ", "centimetre (BrE) (NAmE centimeter) n. (abbr. cm) ", "central adj. ", "centre (BrE) (NAmE center) n. ", "century n. ", "ceremony n. ", "certain adj., pron. ", "certainly adv. ", "certificate n. ", "chain n., v. ", "chair n. ", "chairman, chairwoman n. ", "challenge n., v. ", "chamber n. ", "chance n. ", "change v., n. ", "channel n. ", "chapter n. ", "character n. ", "characteristic adj., n. ", "charge n., v. ", "charity n. ", "chart n., v. ", "chase v., n. ", "chat v., n. ", "cheap adj. ", "cheaply adv. ", "cheat v., n. ", "check v., n. ", "cheek n. ", "cheerful adj. ", "cheerfully adv. ", "cheese n. ", "chemical adj., n. ", "chemist n. ", "chemist’s n. (BrE) ", "chemistry n. ", "cheque n. (BrE) (NAmE check) ", "chest n. ", "chew v. ", "chicken n. ", "chief adj., n. ", "child n. ", "chin n. ", "chip n. ", "chocolate n. ", "choice n. ", "choose v. ", "chop v. ", "church n. ", "cigarette n. ", "cinema n. (especially BrE) ", "circle n. ", "circumstance n. ", "citizen n. ", "city n. ", "civil adj. ", "claim v., n. ", "clap v., n. ", "class n. ", "classic adj., n. ", "classroom n. ", "clean adj., v. ", "clear adj., v. ", "clearly adv. ", "clerk n. ", "clever adj. ", "click v., n. ", "client n. ", "climate n. ", "climb v. ", "climbing n. ", "clock n. ", "close /kl??s, NAmE klo?s/ adj. ", "close /kl??z, NAmE kl??z/ v. ", "closed adj. ", "closely adv. ", "closet n. (especially NAmE) ", "cloth n. ", "clothes n. ", "clothing n. ", "cloud n. ", "club n. ", "cm abbr.  centimetre ", "coach n. ", "coal n. ", "coast n. ", "coat n. ", "code n. ", "coffee n. ", "coin n. ", "cold adj., n. ", "coldly adv. ", "collapse v., n. ", "colleague n. ", "collect v. ", "collection n. ", "college n. ", "colour (BrE) (NAmE color) n., v. ", "coloured (BrE) (NAmE colored) adj. ", "column n. ", "combination n. ", "combine v. ", "come v. ", "comedy n. ", "comfort n., v. ", "comfortable adj. ", "comfortably adv. ", "command v., n. ", "comment n., v. ", "commercial adj. ", "commission n., v. ", "commit v. ", "commitment n. ", "committee n. ", "common adj. ", "commonly adv. ", "communicate v. ", "communication n. ", "community n. ", "company n. ", "compare v. ", "comparison n. ", "compete v. ", "competition n. ", "competitive adj. ", "complain v. ", "complaint n. ", "complete adj., v. ", "completely adv. ", "complex adj. ", "complicate v. ", "complicated adj. ", "computer n. ", "concentrate v. ", "concentration n. ", "concept n. ", "concern v., n. ", "concerned adj. ", "concerning prep. ", "concert n. ", "conclude v. ", "conclusion n. ", "concrete adj., n. ", "condition n. ", "conduct v., n. ", "conference n. ", "confidence n. ", "confident adj. ", "confidently adv. ", "confine v. ", "confined adj. ", "confirm v. ", "conflict n., v. ", "confront v. ", "confuse v. ", "confused adj. ", "confusing adj. ", "confusion n. ", "congratulations n. ", "congress n. ", "connect v. ", "connection n. ", "conscious adj. ", "consequence n. ", "conservative adj. ", "consider v. ", "considerable adj. ", "considerably adv. ", "consideration n. ", "consist of v. ", "constant adj. ", "constantly adv. ", "construct v. ", "construction n. ", "consult v. ", "consumer n. ", "contact n., v. ", "contain v. ", "container n. ", "contemporary adj. ", "content n. ", "contest n. ", "context n. ", "continent n. ", "continue v. ", "continuous adj. ", "continuously adv. ", "contract n., v. ", "contrast n., v. ", "contrasting adj. ", "contribute v. ", "contribution n. ", "control n., v. ", "controlled adj. ", "convenient adj. ", "convention n. ", "conventional adj. ", "conversation n. ", "convert v. ", "convince v. ", "cook v., n. ", "cooker n. (BrE) ", "cookie n. (especially NAmE) ", "cooking n. ", "cool adj., v. ", "cope (with) v. ", "copy n., v. ", "core n. ", "corner n. ", "correct adj., v. ", "correctly adv. ", "cost n., v. ", "cottage n. ", "cotton n. ", "cough v., n. ", "coughing n. ", "could  can ", "could modal v. ", "council n. ", "count v. ", "counter n. ", "country n. ", "countryside n. ", "county n. ", "couple n. ", "courage n. ", "course n. ", "court n. ", "cousin n. ", "cover v., n. ", "covered adj. ", "covering n. ", "cow n. ", "crack n., v. ", "cracked adj. ", "craft n. ", "crash n., v. ", "crazy adj. ", "cream n., adj. ", "create v. ", "creature n. ", "credit card n. ", "credit n. ", "crime n. ", "criminal adj., n. ", "crisis n. ", "crisp adj. ", "criterion n. ", "critical adj. ", "criticism n. ", "criticize (BrE also -ise) v. ", "crop n. ", "cross n., v. ", "crowd n. ", "crowded adj. ", "crown n. ", "crucial adj. ", "cruel adj. ", "crush v. ", "cry v., n. ", "ct abbr.  cent ", "cultural adj. ", "culture n. ", "cup n. ", "cupboard n. ", "curb v. ", "cure v., n. ", "curious adj. ", "curiously adv. ", "curl v., n. ", "curly adj. ", "current adj., n. ", "currently adv. ", "curtain n. ", "curve n., v. ", "curved adj. ", "custom n. ", "customer n. ", "customs n. ", "cut v., n. ", "cycle n., v. ", "cycling n. ", "dad n. ", "daily adj. ", "damage n., v. ", "damp adj. ", "dance n., v. ", "dancer n. ", "dancing n. ", "danger n. ", "dangerous adj. ", "dare v. ", "dark adj., n. ", "data n. ", "date n., v. ", "daughter n. ", "day n. ", "dead adj. ", "deaf adj. ", "deal v., n. ", "deal with ", "dear adj. ", "death n. ", "debate n., v. ", "debt n. ", "decade n. ", "decay n., v. ", "December n. (abbr. Dec.) ", "decide v. ", "decision n. ", "declare v. ", "decline n., v. ", "decorate v. ", "decoration n. ", "decorative adj. ", "decrease v., n. ", "deep adj., adv. ", "deeply adv. ", "defeat v., n. ", "defence (BrE) (NAmE defense) n. ", "defend v. ", "define v. ", "definite adj. ", "definitely adv. ", "definition n. ", "degree n. ", "delay n., v. ", "deliberate adj. ", "deliberately adv. ", "delicate adj. ", "delight n., v. ", "delighted adj. ", "deliver v. ", "delivery n. ", "demand n., v. ", "demonstrate v. ", "dentist n. ", "deny v. ", "department n. ", "departure n. ", "depend (on) v. ", "deposit n., v. ", "depress v. ", "depressed adj. ", "depressing adj. ", "depth n. ", "derive v. ", "describe v. ", "description n. ", "desert n., v. ", "deserted adj. ", "deserve v. ", "design n., v. ", "desire n., v. ", "desk n. ", "desperate adj. ", "desperately adv. ", "despite prep. ", "destroy v. ", "destruction n. ", "detail n. ", "detailed adj. ", "determination n. ", "determine v. ", "determined adj. ", "develop v. ", "development n. ", "device n. ", "devote v. ", "devoted adj. ", "diagram n. ", "diamond n. ", "diary n. ", "dictionary n. ", "die v. ", "diet n. ", "difference n. ", "different adj. ", "differently adv. ", "difficult adj. ", "difficulty n. ", "dig v. ", "dinner n. ", "direct adj., v. ", "direction n. ", "directly adv. ", "director n. ", "dirt n. ", "dirty adj. ", "disabled adj. ", "disadvantage n. ", "disagree v. ", "disagreement n. ", "disappear v. ", "disappoint v. ", "disappointed adj. ", "disappointing adj. ", "disappointment n. ", "disapproval n. ", "disapprove (of) v. ", "disapproving adj. ", "disaster n. ", "disc (also disk, especially in NAmE) n. ", "discipline n. ", "discount n. ", "discover v. ", "discovery n. ", "discuss v. ", "discussion n. ", "disease n. ", "disgust v., n. ", "disgusted adj. ", "disgusting adj. ", "dish n. ", "dishonest adj. ", "dishonestly adv. ", "disk n. ", "dislike v., n. ", "dismiss v. ", "display v., n. ", "dissolve v. ", "distance n. ", "distinguish v. ", "distribute v. ", "distribution n. ", "district n. ", "disturb v. ", "disturbing adj. ", "divide v. ", "division n. ", "divorce n., v. ", "divorced adj. ", "do v., auxiliary v. ", "doctor n. (abbr. Dr, NAmE Dr.) ", "document n. ", "dog n. ", "dollar n. ", "domestic adj. ", "dominate v. ", "door n. ", "dot n. ", "double adj., det., adv., n., v. ", "doubt n., v. ", "down adv., prep. ", "downstairs adv., adj., n. ", "downward adj. ", "downwards (also downward especially in NAmE) adv. ", "dozen n., det. ", "Dr (BrE) (also Dr. NAmE, BrE) abbr.  doctor ", "draft n., adj., v. ", "drag v. ", "drama n. ", "dramatic adj. ", "dramatically adv. ", "draw v. ", "drawer n. ", "drawing n. ", "dream n., v. ", "dress n., v. ", "dressed adj. ", "drink n., v. ", "drive v., n. ", "driver n. ", "driving n. ", "drop v., n. ", "drug n. ", "drugstore n. (NAmE) ", "drum n. ", "drunk adj. ", "dry adj., v. ", "due adj. ", "due to ", "dull adj. ", "dump v., n. ", "during prep. ", "dust n., v. ", "duty n. ", "DVD n. ", "dying adj. ", "e.g. abbr. ", "each det., pron. ", "each other (also one another) pron. ", "ear n. ", "early adj., adv. ", "earn v. ", "earth n. ", "ease n., v. ", "easily adv. ", "east n., adj., adv. ", "eastern adj. ", "easy adj. ", "eat v. ", "economic adj. ", "economy n. ", "edge n. ", "edition n. ", "editor n. ", "educate v. ", "educated adj. ", "education n. ", "effect n. ", "effective adj. ", "effectively adv. ", "efficient adj. ", "efficiently adv. ", "effort n. ", "egg n. ", "either det., pron., adv. ", "elbow n. ", "elderly adj. ", "elect v. ", "election n. ", "electric adj. ", "electrical adj. ", "electricity n. ", "electronic adj. ", "elegant adj. ", "element n. ", "elevator n. (NAmE) ", "else adv. ", "elsewhere adv. ", "email (also e-mail) n., v. ", "embarrass v. ", "embarrassed adj. ", "embarrassing adj. ", "embarrassment n. ", "emerge v. ", "emergency n. ", "emotion n. ", "emotional adj. ", "emotionally adv. ", "emphasis n. ", "emphasize (BrE also -ise) v. ", "empire n. ", "employ v. ", "employee n. ", "employer n. ", "employment n. ", "empty adj., v. ", "enable v. ", "encounter v., n. ", "encourage v. ", "encouragement n. ", "end n., v. ", "ending n. ", "enemy n. ", "energy n. ", "engage v. ", "engaged adj. ", "engine n. ", "engineer n. ", "engineering n. ", "enjoy v. ", "enjoyable adj. ", "enjoyment n. ", "enormous adj. ", "enough det., pron., adv. ", "enquiry (also inquiry especially in NAmE) n. ", "ensure v. ", "enter v. ", "entertain v. ", "entertainer n. ", "entertaining adj. ", "entertainment n. ", "enthusiasm n. ", "enthusiastic adj. ", "entire adj. ", "entirely adv. ", "entitle v. ", "entrance n. ", "entry n. ", "envelope n. ", "environment n. ", "environmental adj. ", "equal adj., n., v. ", "equally adv. ", "equipment n. ", "equivalent adj., n. ", "error n. ", "escape v., n. ", "especially adv. ", "essay n. ", "essential adj., n. ", "essentially adv. ", "establish v. ", "estate n. ", "estimate n., v. ", "etc. (full form et cetera) ", "euro n. ", "even adv., adj. ", "evening n. ", "event n. ", "eventually adv. ", "ever adv. ", "every det. ", "everyone (also everybody) pron. ", "everything pron. ", "everywhere adv. ", "evidence n. ", "evil adj., n. ", "ex- prefix ", "exact adj. ", "exactly adv. ", "exaggerate v. ", "exaggerated adj. ", "exam n. ", "examination n. ", "examine v. ", "example n. ", "excellent adj. ", "except prep., conj. ", "exception n. ", "exchange v., n. ", "excite v. ", "excited adj. ", "excitement n. ", "exciting adj. ", "exclude v. ", "excluding prep. ", "excuse n., v. ", "executive n., adj. ", "exercise n., v. ", "exhibit v., n. ", "exhibition n. ", "exist v. ", "existence n. ", "exit n. ", "expand v. ", "expect v. ", "expectation n. ", "expected adj. ", "expense n. ", "expensive adj. ", "experience n., v. ", "experienced adj. ", "experiment n., v. ", "expert n., adj. ", "explain v. ", "explanation n. ", "explode v. ", "explore v. ", "explosion n. ", "export v., n. ", "expose v. ", "express v., adj. ", "expression n. ", "extend v. ", "extension n. ", "extensive adj. ", "extent n. ", "extra adj., n., adv. ", "extraordinary adj. ", "extreme adj., n. ", "extremely adv. ", "eye n. ", "face n., v. ", "facility n. ", "fact n. ", "factor n. ", "factory n. ", "fail v. ", "failure n. ", "faint adj. ", "faintly adv. ", "fair adj. ", "fairly adv. ", "faith n. ", "faithful adj. ", "faithfully adv. ", "fall asleep ", "fall over ", "fall v., n. ", "false adj. ", "fame n. ", "familiar adj. ", "family n., adj. ", "famous adj. ", "fan n. ", "fancy v., adj. ", "far adv., adj. ", "farm n. ", "farmer n. ", "farming n. ", "farther, farthest  far ", "fashion n. ", "fashionable adj. ", "fast adj., adv. ", "fasten v. ", "fat adj., n. ", "father n. ", "faucet n. (NAmE) ", "fault n. ", "favour (BrE) (NAmE favor) n. ", "favourite (BrE) (NAmE favorite) adj., n. ", "fear n., v. ", "feather n. ", "feature n., v. ", "February n. (abbr. Feb.) ", "federal adj. ", "fee n. ", "feed v. ", "feel sick (especially BrE) ", "feel v. ", "feeling n. ", "fellow n., adj. ", "female adj., n. ", "fence n. ", "festival n. ", "fetch v. ", "fever n. ", "few det., adj., pron. ", "field n. ", "fight v., n. ", "fighting n. ", "figure n., v. ", "file n. ", "fill v. ", "film n., v. ", "final adj., n. ", "finally adv. ", "finance n., v. ", "financial adj. ", "find out sth ", "find v. ", "fine adj. ", "finely adv. ", "finger n. ", "finish v., n. ", "finished adj. ", "fire n., v. ", "firm n., adj., adv. ", "firmly adv. ", "first det., ordinal number, adv., n. ", "fish n., v. ", "fishing n. ", "fit v., adj. ", "fix v. ", "fixed adj. ", "flag n. ", "flame n. ", "flash v., n. ", "flat adj., n. ", "flavour (BrE) (NAmE flavor) n., v. ", "flesh n. ", "flight n. ", "float v. ", "flood n., v. ", "floor n. ", "flour n. ", "flow n., v. ", "flower n. ", "flu n. ", "fly v., n. ", "flying adj., n. ", "focus v., n. ", "fold v., n. ", "folding adj. ", "follow v. ", "following adj., n., prep. ", "food n. ", "foot n. ", "football n. ", "for instance ", "for prep. ", "force n., v. ", "forecast n., v. ", "foreign adj. ", "forest n. ", "forever (BrE also for ever) adv. ", "forget v. ", "forgive v. ", "fork n. ", "form n., v. ", "formal adj. ", "formally adv. ", "former adj. ", "formerly adv. ", "formula n. ", "fortune n. ", "forward (also forwards) adv. ", "forward adj. ", "found v. ", "foundation n. ", "frame n., v. ", "free adj., v., adv. ", "freedom n. ", "freely adv. ", "freeze v. ", "frequent adj. ", "frequently adv. ", "fresh adj. ", "freshly adv. ", "Friday n. (abbr. Fri.) ", "fridge n. (BrE) ", "friend n. ", "friendly adj. ", "friendship n. ", "frighten v. ", "frightened adj. ", "frightening adj. ", "from prep. ", "front n., adj. ", "frozen  freeze ", "frozen adj. ", "fruit n. ", "fry v., n. ", "fuel n. ", "full adj. ", "fully adv. ", "fun n., adj. ", "function n., v. ", "fund n., v. ", "fundamental adj. ", "funeral n. ", "funny adj. ", "fur n. ", "furniture n. ", "further adj. ", "further, furthest  far ", "future n., adj. ", "g abbr.  gram ", "gain v., n. ", "gallon n. ", "gamble v., n. ", "gambling n. ", "game n. ", "gap n. ", "garage n. ", "garbage n. (especially NAmE) ", "garden n. ", "gas n. ", "gasoline n. (NAmE) ", "gate n. ", "gather v. ", "gear n. ", "general adj. ", "generally adv. ", "generate v. ", "generation n. ", "generous adj. ", "generously adv. ", "gentle adj. ", "gentleman n. ", "gently adv. ", "genuine adj. ", "genuinely adv. ", "geography n. ", "get off ", "get on ", "get v. ", "giant n., adj. ", "gift n. ", "girl n. ", "girlfriend n. ", "give (sth) up ", "give birth (to) ", "give sth away ", "give sth out ", "give v. ", "glad adj. ", "glass n. ", "glasses n. ", "global adj. ", "glove n. ", "glue n., v. ", "gm abbr.  gram ", "go bad ", "go down ", "go up ", "go v. ", "go wrong ", "goal n. ", "god n. ", "gold n., adj. ", "good adj., n. ", "good at ", "good for ", "goodbye exclamation, n. ", "goods n. ", "govern v. ", "government n. ", "governor n. ", "grab v. ", "grade n., v. ", "gradual adj. ", "gradually adv. ", "grain n. ", "gram (BrE also gramme) n. (abbr. g, gm) ", "grammar n. ", "grand adj. ", "grandchild n. ", "granddaughter n. ", "grandfather n. ", "grandmother n. ", "grandparent n. ", "grandson n. ", "grant v., n. ", "grass n. ", "grateful adj. ", "grave n., adj. ", "gray (NAmE)  grey ", "great adj. ", "greatly adv. ", "green adj., n. ", "grey (BrE) (NAmE usually gray) adj., n. ", "groceries n. ", "grocery (NAmE usually grocery store) n. ", "ground n. ", "group n. ", "grow up ", "grow v. ", "growth n. ", "guarantee n., v. ", "guard n., v. ", "guess v., n. ", "guest n. ", "guide n., v. ", "guilty adj. ", "gun n. ", "guy n. ", "habit n. ", "hair n. ", "hairdresser n. ", "half n., det., pron., adv. ", "hall n. ", "hammer n. ", "hand n., v. ", "handle v., n. ", "hang v. ", "happen v. ", "happily adv. ", "happiness n. ", "happy adj. ", "hard adj., adv. ", "hardly adv. ", "harm n., v. ", "harmful adj. ", "harmless adj. ", "hat n. ", "hate v., n. ", "hatred n. ", "have to modal v. ", "have v., auxiliary v. ", "he pron. ", "head n., v. ", "headache n. ", "heal v. ", "health n. ", "healthy adj. ", "hear v. ", "hearing n. ", "heart n. ", "heat n., v. ", "heating n. ", "heaven n. ", "heavily adv. ", "heavy adj. ", "heel n. ", "height n. ", "hell n. ", "hello exclamation, n. ", "help v., n. ", "helpful adj. ", "hence adv. ", "her pron., det. ", "here adv. ", "hero n. ", "hers pron. ", "herself pron. ", "hesitate v. ", "hi exclamation ", "hide v. ", "high adj., adv. ", "highlight v., n. ", "highly adv. ", "highway n. (especially NAmE) ", "hill n. ", "him pron. ", "himself pron. ", "hip n. ", "hire v., n. ", "his det., pron. ", "historical adj. ", "history n. ", "hit v., n. ", "hobby n. ", "hold v., n. ", "hole n. ", "holiday n. ", "hollow adj. ", "holy adj. ", "home n., adv.. ", "homework n. ", "honest adj. ", "honestly adv. ", "honour (BrE) (NAmE honor) n. ", "hook n. ", "hope v., n. ", "horizontal adj. ", "horn n. ", "horror n. ", "horse n. ", "hospital n. ", "host n., v. ", "hot adj. ", "hotel n. ", "hour n. ", "house n. ", "household n., adj. ", "housing n. ", "how adv. ", "however adv. ", "huge adj. ", "human adj., n. ", "humorous adj. ", "humour (BrE) (NAmE humor) n. ", "hungry adj. ", "hunt v. ", "hunting n. ", "hurry v., n. ", "hurt v. ", "husband n. ", "I pron. ", "i.e. abbr. ", "ice cream n. ", "ice n. ", "idea n. ", "ideal adj., n. ", "ideally adv. ", "identify v. ", "identity n. ", "if conj. ", "ignore v. ", "ill adj. (especially BrE) ", "illegal adj. ", "illegally adv. ", "illness n. ", "illustrate v. ", "image n. ", "imaginary adj. ", "imagination n. ", "imagine v. ", "immediate adj. ", "immediately adv. ", "immoral adj. ", "impact n. ", "impatient adj. ", "impatiently adv. ", "implication n. ", "imply v. ", "import n., v. ", "importance n. ", "important adj. ", "importantly adv. ", "impose v. ", "impossible adj. ", "impress v. ", "impressed adj. ", "impression n. ", "impressive adj. ", "improve v. ", "improvement n. ", "in a hurry ", "in addition (to) ", "in advance ", "in case (of) ", "in charge of ", "in common ", "in control (of) ", "in detail ", "in exchange (for) ", "in favour/favor (of) ", "in front (of) ", "in general ", "in honour/honor of ", "in memory of ", "in order to ", "in prep., adv. ", "in public ", "in the end ", "inability n. ", "inch n. ", "incident n. ", "include v. ", "including prep. ", "income n. ", "increase v., n. ", "increasingly adv. ", "indeed adv. ", "independence n. ", "independent adj. ", "independently adv. ", "index n. ", "indicate v. ", "indication n. ", "indirect adj. ", "indirectly adv. ", "individual adj., n. ", "indoor adj. ", "indoors adv. ", "industrial adj. ", "industry n. ", "inevitable adj. ", "inevitably adv. ", "infect v. ", "infected adj. ", "infection n. ", "infectious adj. ", "influence n., v. ", "inform v. ", "informal adj. ", "information n. ", "ingredient n. ", "initial adj., n. ", "initially adv. ", "initiative n. ", "injure v. ", "injured adj. ", "injury n. ", "ink n. ", "inner adj. ", "innocent adj. ", "inquiry  enquiry ", "insect n. ", "insert v. ", "inside prep., adv., n., adj. ", "insist (on) v. ", "install v. ", "instance n. ", "instead adv. ", "instead of ", "institute n. ", "institution n. ", "instruction n. ", "instrument n. ", "insult v., n. ", "insulting adj. ", "insurance n. ", "intelligence n. ", "intelligent adj. ", "intend v. ", "intended adj. ", "intention n. ", "interest n., v. ", "interested adj. ", "interesting adj. ", "interior n., adj. ", "internal adj. ", "international adj. ", "Internet n. ", "interpret v. ", "interpretation n. ", "interrupt v. ", "interruption n. ", "interval n. ", "interview n., v. ", "into prep. ", "introduce v. ", "introduction n. ", "invent v. ", "invention n. ", "invest v. ", "investigate v. ", "investigation n. ", "investment n. ", "invitation n. ", "invite v. ", "involve v. ", "involved in ", "involvement n. ", "iron n., v. ", "irritate v. ", "irritated adj. ", "irritating adj. ", "island n. ", "issue n., v. ", "it pron., det. ", "item n. ", "its det. ", "itself pron. ", "jacket n. ", "jam n. ", "January n. (abbr. Jan.) ", "jealous adj. ", "jeans n. ", "jelly n. ", "jewellery (BrE) (NAmE jewelry) n. ", "job n. ", "join v. ", "joint adj., n. ", "jointly adv. ", "joke n., v. ", "journalist n. ", "journey n. ", "joy n. ", "judge n., v. ", "judgement (also judgment especially in NAmE) n. ", "juice n. ", "July n. (abbr. Jul.) ", "jump v., n. ", "June n. (abbr. Jun.) ", "junior adj., n. ", "just adv. ", "justice n. ", "justified adj. ", "justify v. ", "k abbr.  kilometre ", "keen adj. ", "keen on ", "keep v. ", "key n., adj. ", "keyboard n. ", "kick v., n. ", "kid n. ", "kill v. ", "killing n. ", "kilogram (BrE also kilogramme) (also kilo) n. (abbr. kg) ", "kilometre (BrE) (NAmE kilometer) n. (abbr. k, km) ", "kind n., adj. ", "kindly adv. ", "kindness n. ", "king n. ", "kiss v., n. ", "kitchen n. ", "km abbr.  kilometre ", "knee n. ", "knife n. ", "knit v. ", "knitted adj. ", "knitting n. ", "knock v., n. ", "knot n. ", "know v. ", "knowledge n. ", "l abbr.  litre ", "label n., v. ", "laboratory, lab n. ", "labour (BrE) (NAmE labor) n. ", "lack n., v. ", "lacking adj. ", "lady n. ", "lake n. ", "lamp n. ", "land n., v. ", "landscape n. ", "lane n. ", "language n. ", "large adj. ", "largely adv. ", "last det., adv., n., v. ", "late adj., adv. ", "later adv., adj. ", "latest adj., n. ", "latter adj., n. ", "laugh v., n. ", "launch v., n. ", "law n. ", "lawyer n. ", "lay v. ", "layer n. ", "lazy adj. ", "lead /li:d/ v., n. ", "leader n. ", "leading adj. ", "leaf n. ", "league n. ", "lean v. ", "learn v. ", "least det., pron., adv. ", "leather n. ", "leave out ", "leave v. ", "lecture n. ", "left adj., adv., n. ", "leg n. ", "legal adj. ", "legally adv. ", "lemon n. ", "lend v. ", "length n. ", "less det., pron., adv. ", "lesson n. ", "let v. ", "letter n. ", "level n., adj. ", "library n. ", "licence (BrE) (NAmE license) n. ", "license v. ", "lid n. ", "lie v., n. ", "life n. ", "lift v., n. ", "light n., adj., v. ", "lightly adv. ", "like prep., v., conj. ", "likely adj., adv. ", "limit n., v. ", "limited adj. ", "line n. ", "link n., v. ", "lip n. ", "liquid n., adj. ", "list n., v. ", "listen (to) v. ", "literature n. ", "litre (BrE) (NAmE liter) n. (abbr. l) ", "little adj., det., pron., adv. ", "live /l?v/ v. ", "live /la?v/ adj., adv. ", "lively adj. ", "living adj. ", "load n., v. ", "loan n. ", "local adj. ", "locally adv. ", "locate v. ", "located adj. ", "location n. ", "lock v., n. ", "logic n. ", "logical adj. ", "lonely adj. ", "long adj., adv. ", "look after (especially BrE) ", "look at ", "look for ", "look forward to ", "look v., n. ", "loose adj. ", "loosely adv. ", "lord n. ", "lorry n. (BrE) ", "lose v. ", "loss n. ", "lost adj. ", "lot: a lot (of) (also lots (of)) pron., det., adv. ", "loud adj., adv. ", "loudly adv. ", "love n., v. ", "lovely adj. ", "lover n. ", "low adj., adv. ", "loyal adj. ", "luck n. ", "lucky adj. ", "luggage n. (especially BrE) ", "lump n. ", "lunch n. ", "lung n. ", "machine n. ", "machinery n. ", "mad adj. ", "magazine n. ", "magic n., adj. ", "mail n., v. ", "main adj. ", "mainly adv. ", "maintain v. ", "major adj. ", "majority n. ", "make friends (with) ", "make fun of ", "make sth up ", "make sure ", "make v., n. ", "make-up n. ", "male adj., n. ", "mall n. (especially NAmE) ", "man n. ", "manage v. ", "management n. ", "manager n. ", "manner n. ", "manufacture v., n. ", "manufacturer n. ", "manufacturing n. ", "many det., pron. ", "map n. ", "March n. (abbr. Mar.) ", "march v., n. ", "mark n., v. ", "market n. ", "marketing n. ", "marriage n. ", "married adj. ", "marry v. ", "mass n., adj. ", "massive adj. ", "master n. ", "match n., v. ", "matching adj. ", "mate n., v. ", "material n., adj. ", "mathematics (also maths BrE, math NAmE) n. ", "matter n., v. ", "maximum adj., n. ", "may modal v. ", "May n. ", "maybe adv. ", "mayor n. ", "me pron. ", "meal n. ", "mean v. ", "meaning n. ", "means n. ", "meanwhile adv. ", "measure v., n. ", "measurement n. ", "meat n. ", "media n. ", "medical adj. ", "medicine n. ", "medium adj., n. ", "meet v. ", "meeting n. ", "melt v. ", "member n. ", "membership n. ", "memory n. ", "mental adj. ", "mentally adv. ", "mention v. ", "menu n. ", "mere adj. ", "merely adv. ", "mess n. ", "message n. ", "metal n. ", "method n. ", "metre (BrE) (NAmE meter) n. ", "mg abbr.  milligram ", "mid- combining form ", "midday n. ", "middle n., adj. ", "midnight n. ", "might modal v. ", "mild adj. ", "mile n. ", "military adj. ", "milk n. ", "milligram (BrE also milligramme) n. (abbr. mg) ", "millimetre (NAmE millimeter) n. (abbr. mm) ", "mind n., v. ", "mine pron., n. ", "mineral n., adj. ", "minimum adj., n. ", "minister n. ", "ministry n. ", "minor adj. ", "minority n. ", "minute n. ", "mirror n. ", "Miss n. ", "miss v., n. ", "missing adj. ", "mistake n., v. ", "mistaken adj. ", "mix v., n. ", "mixed adj. ", "mixture n. ", "mm abbr.  millimetre ", "mobile adj. ", "mobile phone (also mobile) n. (BrE) ", "model n. ", "modern adj. ", "mom (NAmE)  mum ", "moment n. ", "Monday n. (abbr. Mon.) ", "money n. ", "monitor n., v. ", "month n. ", "mood n. ", "moon n. ", "moral adj. ", "morally adv. ", "more det., pron., adv. ", "moreover adv. ", "morning n. ", "most det., pron., adv. ", "mostly adv. ", "mother n. ", "motion n. ", "motor n. ", "motorcycle (BrE also motorbike) n. ", "mount v., n. ", "mountain n. ", "mouse n. ", "mouth n. ", "move v., n. ", "movement n. ", "movie n. (especially NAmE) ", "movie theater n. (NAmE) ", "moving adj. ", "Mr (BrE) (also Mr. NAmE, BrE) abbr. ", "Mrs (BrE) (also Mrs. NAmE, BrE) abbr. ", "Ms (BrE) (also Ms. NAmE, BrE) abbr. ", "much det., pron., adv. ", "mud n. ", "multiply v. ", "mum (BrE) (NAmE mom) n. ", "murder n., v. ", "muscle n. ", "museum n. ", "music n. ", "musical adj. ", "musician n. ", "must modal v. ", "my det. ", "myself pron. ", "mysterious adj. ", "mystery n. ", "nail n. ", "naked adj. ", "name n., v. ", "narrow adj. ", "nation n. ", "national adj. ", "natural adj. ", "naturally adv. ", "nature n. ", "navy n. ", "near adj., adv., prep. ", "nearby adj., adv. ", "nearly adv. ", "neat adj. ", "neatly adv. ", "necessarily adv. ", "necessary adj. ", "neck n. ", "need v., modal v., n. ", "needle n. ", "negative adj. ", "neighbour (BrE) (NAmE neighbor) n. ", "neighbourhood (BrE) (NAmE neighborhood) n. ", "neither det., pron., adv. ", "nephew n. ", "nerve n. ", "nervous adj. ", "nervously adv. ", "nest n., v. ", "net n. ", "network n. ", "never adv. ", "nevertheless adv. ", "new adj. ", "newly adv. ", "news n. ", "newspaper n. ", "next adj., adv., n. ", "next to prep. ", "nice adj. ", "nicely adv. ", "niece n. ", "night n. ", "no exclamation, det. ", "no one  nobody ", "No. (also no.) abbr.  number ", "nobody (also no one) pron. ", "noise n. ", "noisily adv. ", "noisy adj. ", "non- prefix ", "none pron. ", "nonsense n. ", "nor conj., adv. ", "normal adj., n. ", "normally adv. ", "north n., adj., adv. ", "northern adj. ", "nose n. ", "not adv. ", "note n., v. ", "nothing pron. ", "notice n., v. ", "noticeable adj. ", "novel n. ", "November n. (abbr. Nov.) ", "now adv. ", "nowhere adv. ", "nuclear adj. ", "number (abbr. No., no.) n. ", "nurse n. ", "nut n. ", "o’clock adv. ", "obey v. ", "object n., v. ", "objective n., adj. ", "observation n. ", "observe v. ", "obtain v. ", "obvious adj. ", "obviously adv. ", "occasion n. ", "occasionally adv. ", "occupied adj. ", "occupy v. ", "occur v. ", "ocean n. ", "October n. (abbr. Oct.) ", "odd adj. ", "oddly adv. ", "of course ", "of prep. ", "off adv., prep. ", "offence (BrE) (NAmE offense) n. ", "offend v. ", "offensive adj. ", "offer v., n. ", "office n. ", "officer n. ", "official adj., n. ", "officially adv. ", "often adv. ", "oh exclamation ", "oil n. ", "OK (also okay) exclamation, adj., adv. ", "old adj. ", "old-fashioned adj. ", "on board ", "on prep., adv. ", "on purpose ", "once adv., conj. ", "one another  each other ", "one number, det., pron. ", "onion n. ", "only adj., adv. ", "onto prep. ", "open adj., v. ", "opening n. ", "openly adv. ", "operate v. ", "operation n. ", "opinion n. ", "opponent n. ", "opportunity n. ", "oppose v. ", "opposed to ", "opposing adj. ", "opposite adj., adv., n., prep. ", "opposition n. ", "option n. ", "or conj. ", "orange n., adj. ", "order n., v. ", "ordinary adj. ", "organ n. ", "organization (BrE also -isation) n. ", "organize (BrE also -ise) v. ", "organized adj. ", "origin n. ", "original adj., n. ", "originally adv. ", "other adj., pron. ", "otherwise adv. ", "ought to modal v. ", "our det. ", "ours pron. ", "ourselves pron. ", "out (of) adv., prep. ", "outdoor adj. ", "outdoors adv. ", "outer adj. ", "outline v., n. ", "output n. ", "outside n., adj., prep., adv. ", "outstanding adj. ", "oven n. ", "over adv., prep. ", "overall adj., adv. ", "overcome v. ", "owe v. ", "own adj., pron., v. ", "owner n. ", "p abbr.  page, penny ", "p.m. (NAmE also P.M.) abbr. ", "pace n. ", "pack v., n. ", "package n., v. ", "packaging n. ", "packet n. ", "page n. (abbr. p) ", "pain n. ", "painful adj. ", "paint n., v. ", "painter n. ", "painting n. ", "pair n. ", "palace n. ", "pale adj. ", "pan n. ", "panel n. ", "pants n. ", "paper n. ", "parallel adj. ", "parent n. ", "park n., v. ", "parliament n. ", "part n. ", "particular adj. ", "particularly adv. ", "partly adv. ", "partner n. ", "partnership n. ", "party n. ", "pass v. ", "passage n. ", "passenger n. ", "passing n., adj. ", "passport n. ", "past adj., n., prep., adv. ", "path n. ", "patience n. ", "patient n., adj. ", "pattern n. ", "pause v., n. ", "pay attention ", "pay v., n. ", "payment n. ", "peace n. ", "peaceful adj. ", "peak n. ", "pen n. ", "pence n. ", "pencil n. ", "penny n. (abbr. p) ", "pension n. ", "people n. ", "pepper n. ", "per cent (NAmE usually percent) n., adj., adv. ", "per prep. ", "perfect adj. ", "perfectly adv. ", "perform v. ", "performance n. ", "performer n. ", "perhaps adv. ", "period n. ", "permanent adj. ", "permanently adv. ", "permission n. ", "permit v. ", "person n. ", "personal adj. ", "personality n. ", "personally adv. ", "persuade v. ", "pet n. ", "petrol n. (BrE) ", "phase n. ", "philosophy n. ", "phone  telephone ", "photocopy n., v. ", "photograph n., v. (also photo n.) ", "photographer n. ", "photography n. ", "phrase n. ", "physical adj. ", "physically adv. ", "physics n. ", "piano n. ", "pick sth up ", "pick v. ", "picture n. ", "piece n. ", "pig n. ", "pile n., v. ", "pill n. ", "pilot n. ", "pin n., v. ", "pink adj., n. ", "pint n. (abbr. pt) ", "pipe n. ", "pitch n. ", "pity n. ", "place n., v. ", "plain adj. ", "plan n., v. ", "plane n. ", "planet n. ", "planning n. ", "plant n., v. ", "plastic n., adj. ", "plate n. ", "platform n. ", "play v., n. ", "player n. ", "pleasant adj. ", "pleasantly adv. ", "please exclamation, v. ", "pleased adj. ", "pleasing adj. ", "pleasure n. ", "plenty pron., adv., n., det. ", "plot n., v. ", "plug n. ", "plus prep., n., adj., conj. ", "pocket n. ", "poem n. ", "poetry n. ", "point n., v. ", "pointed adj. ", "poison n., v. ", "poisonous adj. ", "pole n. ", "police n. ", "policy n. ", "polish n., v. ", "polite adj. ", "politely adv. ", "political adj. ", "politically adv. ", "politician n. ", "politics n. ", "pollution n. ", "pool n. ", "poor adj. ", "pop n., v. ", "popular adj. ", "population n. ", "port n. ", "pose v., n. ", "position n. ", "positive adj. ", "possess v. ", "possession n. ", "possibility n. ", "possible adj. ", "possibly adv. ", "post n., v. ", "post office n. ", "pot n. ", "potato n. ", "potential adj., n. ", "potentially adv. ", "pound n. ", "pour v. ", "powder n. ", "power n. ", "powerful adj. ", "practical adj. ", "practically adv. ", "practice n. (BrE, NAmE), v. (NAmE) ", "practise v. (BrE) ", "praise n., v. ", "prayer n. ", "precise adj. ", "precisely adv. ", "predict v. ", "prefer v. ", "preference n. ", "pregnant adj. ", "premises n. ", "preparation n. ", "prepare v. ", "prepared adj. ", "presence n. ", "present adj., n., v. ", "presentation n. ", "preserve v. ", "president n. ", "press n., v. ", "pressure n. ", "presumably adv. ", "pretend v. ", "pretty adv., adj. ", "prevent v. ", "previous adj. ", "previously adv. ", "price n. ", "pride n. ", "priest n. ", "primarily adv. ", "primary adj. ", "prime minister n. ", "prince n. ", "princess n. ", "principle n. ", "print v., n. ", "printer n. ", "printing n. ", "prior adj. ", "priority n. ", "prison n. ", "prisoner n. ", "private adj. ", "privately adv. ", "prize n. ", "probable adj. ", "probably adv. ", "problem n. ", "procedure n. ", "proceed v. ", "process n., v. ", "produce v. ", "producer n. ", "product n. ", "production n. ", "profession n. ", "professional adj., n. ", "professor n. ", "profit n. ", "program n., v. ", "programme n. (BrE) ", "progress n., v. ", "project n., v. ", "promise v., n. ", "promote v. ", "promotion n. ", "prompt adj., v. ", "promptly adv. ", "pronounce v. ", "pronunciation n. ", "proof n. ", "proper adj. ", "properly adv. ", "property n. ", "proportion n. ", "proposal n. ", "propose v. ", "prospect n. ", "protect v. ", "protection n. ", "protest n., v. ", "proud adj. ", "proudly adv. ", "prove v. ", "provide v. ", "provided (also providing) conj. ", "pt abbr.  pint ", "pub n. ", "public adj., n. ", "publication n. ", "publicity n. ", "publicly adv. ", "publish v. ", "publishing n. ", "pull v., n. ", "punch v., n. ", "punish v. ", "punishment n. ", "pupil n. (especially BrE) ", "purchase n., v. ", "pure adj. ", "purely adv. ", "purple adj., n. ", "purpose n. ", "pursue v. ", "push v., n. ", "put sth on ", "put sth out ", "put v. ", "qualification n. ", "qualified adj. ", "qualify v. ", "quality n. ", "quantity n. ", "quarter n. ", "queen n. ", "question n., v. ", "quick adj. ", "quickly adv. ", "quiet adj. ", "quietly adv. ", "quit v. ", "quite adv. ", "quote v. ", "race n., v. ", "racing n. ", "radio n. ", "rail n. ", "railway (BrE) (NAmE railroad) n. ", "rain n., v. ", "raise v. ", "range n. ", "rank n., v. ", "rapid adj. ", "rapidly adv. ", "rare adj. ", "rarely adv. ", "rate n., v. ", "rather adv. ", "rather than ", "raw adj. ", "re- prefix ", "reach v. ", "react v. ", "reaction n. ", "read v. ", "reader n. ", "reading n. ", "ready adj. ", "real adj. ", "realistic adj. ", "reality n. ", "realize (BrE also -ise) v. ", "really  real ", "really adv. ", "rear n., adj. ", "reason n. ", "reasonable adj. ", "reasonably adv. ", "recall v. ", "receipt n. ", "receive v. ", "recent adj. ", "recently adv. ", "reception n. ", "reckon v. ", "recognition n. ", "recognize (BrE also -ise) v. ", "recommend v. ", "record n., v. ", "recording n. ", "recover v. ", "red adj., n. ", "reduce v. ", "reduction n. ", "refer to v. ", "reference n. ", "reflect v. ", "reform v., n. ", "refrigerator n. ", "refusal n. ", "refuse v. ", "regard v., n. ", "regarding prep. ", "region n. ", "regional adj. ", "register v., n. ", "regret v., n. ", "regular adj. ", "regularly adv. ", "regulation n. ", "reject v. ", "relate v. ", "related (to) adj. ", "relation n. ", "relationship n. ", "relative adj., n. ", "relatively adv. ", "relax v. ", "relaxed adj. ", "relaxing adj. ", "release v., n. ", "relevant adj. ", "relief n. ", "religion n. ", "religious adj. ", "rely on v. ", "remain v. ", "remaining adj. ", "remains n. ", "remark n., v. ", "remarkable adj. ", "remarkably adv. ", "remember v. ", "remind v. ", "remote adj. ", "removal n. ", "remove v. ", "rent n., v. ", "rented adj. ", "repair v., n. ", "repeat v. ", "repeated adj. ", "repeatedly adv. ", "replace v. ", "reply n., v. ", "report v., n. ", "represent v. ", "representative n., adj. ", "reproduce v. ", "reputation n. ", "request n., v. ", "require v. ", "requirement n. ", "rescue v., n. ", "research n. ", "reservation n. ", "reserve v., n. ", "resident n., adj. ", "resist v. ", "resistance n. ", "resolve v. ", "resort n. ", "resource n. ", "respect n., v. ", "respond v. ", "response n. ", "responsibility n. ", "responsible adj. ", "rest n., v. ", "restaurant n. ", "restore v. ", "restrict v. ", "restricted adj. ", "restriction n. ", "result n., v. ", "retain v. ", "retire v. ", "retired adj. ", "retirement n. ", "return v., n. ", "reveal v. ", "reverse v., n. ", "review n., v. ", "revise v. ", "revision n. ", "revolution n. ", "reward n., v. ", "rhythm n. ", "rice n. ", "rich adj. ", "rid v.: get rid of ", "ride v., n. ", "rider n. ", "ridiculous adj. ", "riding n. ", "right adj., adv., n. ", "rightly adv. ", "ring n., v. ", "rise n., v. ", "risk n., v. ", "rival n., adj. ", "river n. ", "road n. ", "rob v. ", "rock n. ", "role n. ", "roll n., v. ", "romantic adj. ", "roof n. ", "room n. ", "root n. ", "rope n. ", "rough adj. ", "roughly adv. ", "round adj., adv., prep., n. ", "rounded adj. ", "route n. ", "routine n., adj. ", "row /r??, NAmE ro?/ n. ", "royal adj. ", "rub v. ", "rubber n. ", "rubbish n. (especially BrE) ", "rude adj. ", "rudely adv. ", "ruin v., n. ", "ruined adj. ", "rule n., v. ", "ruler n. ", "rumour n. ", "run v., n. ", "runner n. ", "running n. ", "rural adj. ", "rush v., n. ", "sack n., v. ", "sad adj. ", "sadly adv. ", "sadness n. ", "safe adj. ", "safely adv. ", "safety n. ", "sail v., n. ", "sailing n. ", "sailor n. ", "salad n. ", "salary n. ", "sale n. ", "salt n. ", "salty adj. ", "same adj., pron. ", "sample n. ", "sand n. ", "satisfaction n. ", "satisfied adj. ", "satisfy v. ", "satisfying adj. ", "Saturday n. (abbr. Sat.) ", "sauce n. ", "save v. ", "saving n. ", "say v. ", "scale n. ", "scare v., n. ", "scared adj. ", "scene n. ", "schedule n., v. ", "scheme n. ", "school n. ", "science n. ", "scientific adj. ", "scientist n. ", "scissors n. ", "score n., v. ", "scratch v., n. ", "scream v., n. ", "screen n. ", "screw n., v. ", "sea n. ", "seal n., v. ", "search n., v. ", "season n. ", "seat n. ", "second det., ordinal number, adv., n. ", "secondary adj. ", "secret adj., n. ", "secretary n. ", "secretly adv. ", "section n. ", "sector n. ", "secure adj., v. ", "security n. ", "see v. ", "seed n. ", "seek v. ", "seem linking v. ", "select v. ", "selection n. ", "self n. ", "self- combining form ", "sell v. ", "senate n. ", "senator n. ", "send v. ", "senior adj., n. ", "sense n. ", "sensible adj. ", "sensitive adj. ", "sentence n. ", "separate adj., v. ", "separated adj. ", "separately adv. ", "separation n. ", "September n. (abbr. Sept.) ", "series n. ", "serious adj. ", "seriously adv. ", "servant n. ", "serve v. ", "service n. ", "session n. ", "set fire to ", "set n., v. ", "settle v. ", "several det., pron. ", "severe adj. ", "severely adv. ", "sew v. ", "sewing n. ", "sex n. ", "sexual adj. ", "sexually adv. ", "shade n. ", "shadow n. ", "shake v., n. ", "shall modal v. ", "shallow adj. ", "shame n. ", "shape n., v. ", "shaped adj. ", "share v., n. ", "sharp adj. ", "sharply adv. ", "shave v. ", "she pron. ", "sheep n. ", "sheet n. ", "shelf n. ", "shell n. ", "shelter n., v. ", "shift v., n. ", "shine v. ", "shiny adj. ", "ship n. ", "shirt n. ", "shock n., v. ", "shocked adj. ", "shocking adj. ", "shoe n. ", "shoot v. ", "shooting n. ", "shop n., v. ", "shopping n. ", "short adj. ", "shortly adv. ", "shot n. ", "should modal v. ", "shoulder n. ", "shout v., n. ", "show v., n. ", "shower n. ", "shut v., adj. ", "shy adj. ", "sick adj. ", "side n. ", "sideways adj., adv. ", "sight n. ", "sign n., v. ", "signal n., v. ", "signature n. ", "significant adj. ", "significantly adv. ", "silence n. ", "silent adj. ", "silk n. ", "silly adj. ", "silver n., adj. ", "similar adj. ", "similarly adv. ", "simple adj. ", "simply adv. ", "since prep., conj., adv. ", "sincere adj. ", "sincerely adv. ", "sing v. ", "singer n. ", "singing n. ", "single adj. ", "sink v. ", "sir n. ", "sister n. ", "sit down ", "sit v. ", "site n. ", "situation n. ", "size n. ", "skilful (BrE) (NAmE skillful) adj. ", "skilfully (BrE) (NAmE skillfully) adv. ", "skill n. ", "skilled adj. ", "skin n. ", "skirt n. ", "sky n. ", "sleep v., n. ", "sleeve n. ", "slice n., v. ", "slide v. ", "slight adj. ", "slightly adv. ", "slip v. ", "slope n., v. ", "slow adj. ", "slowly adv. ", "small adj. ", "smart adj. ", "smash v., n. ", "smell v., n. ", "smile v., n. ", "smoke n., v. ", "smoking n. ", "smooth adj. ", "smoothly adv. ", "snake n. ", "snow n., v. ", "so adv., conj. ", "so that ", "soap n. ", "social adj. ", "socially adv. ", "society n. ", "sock n. ", "soft adj. ", "softly adv. ", "software n. ", "soil n. ", "soldier n. ", "solid adj., n. ", "solution n. ", "solve v. ", "some det., pron. ", "somebody (also someone) pron. ", "somehow adv. ", "something pron. ", "sometimes adv. ", "somewhat adv. ", "somewhere adv. ", "son n. ", "song n. ", "soon adv. ", "sore adj. ", "sorry adj. ", "sort n., v. ", "soul n. ", "sound n., v. ", "soup n. ", "sour adj. ", "source n. ", "south n., adj., adv. ", "southern adj. ", "space n. ", "spare adj., n. ", "speak v. ", "speaker n. ", "special adj. ", "specialist n. ", "specially adv. ", "specific adj. ", "specifically adv. ", "speech n. ", "speed n. ", "spell v., n. ", "spelling n. ", "spend v. ", "spice n. ", "spicy adj. ", "spider n. ", "spin v. ", "spirit n. ", "spiritual adj. ", "spite n.: in spite of ", "split v., n. ", "spoil v. ", "spoken  speak ", "spoken adj. ", "spoon n. ", "sport n. ", "spot n. ", "spray n., v. ", "spread v. ", "spring n. ", "square adj., n. ", "squeeze v., n. ", "stable adj., n. ", "staff n. ", "stage n. ", "stair n. ", "stamp n., v. ", "stand up ", "stand v., n. ", "standard n., adj. ", "star n., v. ", "stare v., n. ", "start v., n. ", "state n., adj., v. ", "statement n. ", "station n. ", "statue n. ", "status n. ", "stay v., n. ", "steadily adv. ", "steady adj. ", "steal v. ", "steam n. ", "steel n. ", "steep adj. ", "steeply adv. ", "steer v. ", "step n., v. ", "stick out ", "stick v., n. ", "sticky adj. ", "stiff adj. ", "stiffly adv. ", "still adv., adj. ", "sting v., n. ", "stir v. ", "stock n. ", "stomach n. ", "stone n. ", "stop v., n. ", "store n., v. ", "storm n. ", "story n. ", "stove n. ", "straight adv., adj. ", "strain n. ", "strange adj. ", "strangely adv. ", "stranger n. ", "strategy n. ", "stream n. ", "street n. ", "strength n. ", "stress n., v. ", "stressed adj. ", "stretch v. ", "strict adj. ", "strictly adv. ", "strike v., n. ", "striking adj. ", "string n. ", "strip v., n. ", "stripe n. ", "striped adj. ", "stroke n., v. ", "strong adj. ", "strongly adv. ", "structure n. ", "struggle v., n. ", "student n. ", "studio n. ", "study n., v. ", "stuff n. ", "stupid adj. ", "style n. ", "subject n. ", "substance n. ", "substantial adj. ", "substantially adv. ", "substitute n., v. ", "succeed v. ", "success n. ", "successful adj. ", "successfully adv. ", "such as ", "such det., pron. ", "suck v. ", "sudden adj. ", "suddenly adv. ", "suffer v. ", "suffering n. ", "sufficient adj. ", "sufficiently adv. ", "sugar n. ", "suggest v. ", "suggestion n. ", "suit n., v. ", "suitable adj. ", "suitcase n. ", "suited adj. ", "sum n. ", "summary n. ", "summer n. ", "sun n. ", "Sunday n. (abbr. Sun.) ", "superior adj. ", "supermarket n. ", "supply n., v. ", "support n., v. ", "supporter n. ", "suppose v. ", "sure adj., adv. ", "surely adv. ", "surface n. ", "surname n. (especially BrE) ", "surprise n., v. ", "surprised adj. ", "surprising adj. ", "surprisingly adv. ", "surround v. ", "surrounding adj. ", "surroundings n. ", "survey n., v. ", "survive v. ", "suspect v., n. ", "suspicion n. ", "suspicious adj. ", "swallow v. ", "swear v. ", "swearing n. ", "sweat n., v. ", "sweater n. ", "sweep v. ", "sweet adj., n. ", "swell v. ", "swelling n. ", "swim v. ", "swimming n. ", "swimming pool n. ", "swing n., v. ", "switch n., v. ", "switch sth off ", "switch sth on ", "swollen  swell ", "swollen adj. ", "symbol n. ", "sympathetic adj. ", "sympathy n. ", "system n. ", "table n. ", "tablet n. ", "tackle v., n. ", "tail n. ", "take (sth) over ", "take action ", "take advantage of ", "take care (of) ", "take notice of ", "take part (in) ", "take place ", "take sth off ", "take v. ", "talk v., n. ", "tall adj. ", "tank n. ", "tap v., n.. ", "tape n. ", "target n. ", "task n. ", "taste n., v. ", "tax n., v. ", "taxi n. ", "tea n. ", "teach v. ", "teacher n. ", "teaching n. ", "team n. ", "tear /t??(r), NAmE t?r/ n. ", "tear /te?(r), NAmE ter/ v., n. ", "technical adj. ", "technique n. ", "technology n. ", "telephone (also phone) n., v. ", "television (also TV) n. ", "tell v. ", "temperature n. ", "temporarily adv. ", "temporary adj. ", "tend v. ", "tendency n. ", "tension n. ", "tent n. ", "term n. ", "terrible adj. ", "terribly adv. ", "test n., v. ", "text n. ", "than prep., conj. ", "thank v. ", "thank you exclamation, n. ", "thanks exclamation, n. ", "that det., pron., conj. ", "the definite article ", "the rest ", "the Web n. ", "theatre (BrE) (NAmE theater) n. ", "their det. ", "theirs pron. ", "them pron. ", "theme n. ", "themselves pron. ", "then adv. ", "theory n. ", "there adv. ", "therefore adv. ", "they pron. ", "thick adj. ", "thickly adv. ", "thickness n. ", "thief n. ", "thin adj. ", "thing n. ", "think v. ", "thinking n. ", "thirsty adj. ", "this det., pron. ", "thorough adj. ", "thoroughly adv. ", "though conj., adv. ", "thought n. ", "thread n. ", "threat n. ", "threaten v. ", "threatening adj. ", "throat n. ", "through prep., adv. ", "throughout prep., adv. ", "throw sth away ", "throw v. ", "thumb n. ", "Thursday n. (abbr. Thur., Thurs.) ", "thus adv. ", "ticket n. ", "tidy adj., v. ", "tie sth up ", "tie v., n. ", "tight adj., adv. ", "tightly adv. ", "till  until ", "time n. ", "timetable n. (especially BrE) ", "tin n. ", "tiny adj. ", "tip n., v. ", "tire v. (BrE, NAmE), n. (NAmE) (BrE tyre) ", "tired adj. ", "tiring adj. ", "title n. ", "to prep., infinitive marker ", "today adv., n. ", "toe n. ", "together adv. ", "toilet n. ", "tomato n. ", "tomorrow adv., n. ", "ton n. ", "tone n. ", "tongue n. ", "tonight adv., n. ", "tonne n. ", "too adv. ", "tool n. ", "tooth n. ", "top n., adj. ", "topic n. ", "total adj., n. ", "totally adv. ", "touch v., n. ", "tough adj. ", "tour n., v. ", "tourist n. ", "towards (also toward especially in NAmE) prep. ", "towel n. ", "tower n. ", "town n. ", "toy n., adj. ", "trace v., n. ", "track n. ", "trade n., v. ", "trading n. ", "tradition n. ", "traditional adj. ", "traditionally adv. ", "traffic n. ", "train n., v. ", "training n. ", "transfer v., n. ", "transform v. ", "translate v. ", "translation n. ", "transparent adj. ", "transport n. (BrE) (NAmE transportation) ", "transport v. (BrE, NAmE) ", "trap n., v. ", "travel v., n. ", "traveller (BrE) (NAmE traveler) n. ", "treat v. ", "treatment n. ", "tree n. ", "trend n. ", "trial n. ", "triangle n. ", "trick n., v. ", "trip n., v. ", "tropical adj. ", "trouble n. ", "trousers n. (especially BrE) ", "truck n. (especially NAmE) ", "true adj. ", "truly adv. ", "trust n., v. ", "truth n. ", "try v. ", "tube n. ", "Tuesday n. (abbr. Tue., Tues.) ", "tune n., v. ", "tunnel n. ", "turn v., n. ", "TV  television ", "twice adv. ", "twin n., adj. ", "twist v., n. ", "twisted adj. ", "type n., v. ", "typical adj. ", "typically adv. ", "tyre n. (BrE) (NAmE tire) ", "ugly adj. ", "ultimate adj. ", "ultimately adv. ", "umbrella n. ", "unable  able ", "unable adj. ", "unacceptable  acceptable ", "unacceptable adj. ", "uncertain  certain ", "uncertain adj. ", "uncle n. ", "uncomfortable  comfortable ", "uncomfortable adj. ", "unconscious  conscious ", "unconscious adj. ", "uncontrolled  control ", "uncontrolled adj. ", "under control ", "under prep., adv. ", "underground adj., adv. ", "underneath prep., adv. ", "understand v. ", "understanding n. ", "underwater adj., adv. ", "underwear n. ", "undo  do ", "undo v. ", "unemployed  employ ", "unemployed adj. ", "unemployment  employment ", "unemployment n. ", "unexpected adj. ", "unexpected, unexpectedly  expect ", "unexpectedly adv. ", "unfair adj. ", "unfair, unfairly  fair ", "unfairly adv. ", "unfortunate adj. ", "unfortunately adv. ", "unfriendly  friendly ", "unfriendly adj. ", "unhappiness  happiness ", "unhappiness n. ", "unhappy  happy ", "unhappy adj. ", "uniform n., adj. ", "unimportant  important ", "unimportant adj. ", "union n. ", "unique adj. ", "unit n. ", "unite v. ", "united adj. ", "universe n. ", "university n. ", "unkind  kind ", "unkind adj. ", "unknown  know ", "unknown adj. ", "unless conj. ", "unlike  like ", "unlike prep., adj. ", "unlikely  likely ", "unlikely adj. ", "unload  load ", "unload v. ", "unlucky  lucky ", "unlucky adj. ", "unnecessary  necessary ", "unnecessary adj. ", "unpleasant  pleasant ", "unpleasant adj. ", "unreasonable  reasonable ", "unreasonable adj. ", "unsteady  steady ", "unsteady adj. ", "unsuccessful  successful ", "unsuccessful adj. ", "untidy  tidy ", "untidy adj. ", "until (also till) conj., prep. ", "unusual adj. ", "unusual, unusually  usual ", "unusually adv. ", "unwilling adj. ", "unwilling, unwillingly  willing ", "unwillingly adv. ", "up adv., prep. ", "upon prep. ", "upper adj. ", "upset v., adj. ", "upsetting adj. ", "upside down adv. ", "upstairs adv., adj., n. ", "upward adj. ", "upwards (also upward especially in NAmE) adv. ", "urban adj. ", "urge v., n. ", "urgent adj. ", "us pron. ", "use v., n. ", "used adj. ", "used to modal v. ", "used to sth/to doing sth ", "useful adj. ", "useless adj. ", "user n. ", "usual adj. ", "usually adv. ", "vacation n. ", "valid adj. ", "valley n. ", "valuable adj. ", "value n., v. ", "van n. ", "variation n. ", "varied adj. ", "variety n. ", "various adj. ", "vary v. ", "vast adj. ", "vegetable n. ", "vehicle n. ", "venture n., v. ", "version n. ", "vertical adj. ", "very adv. ", "via prep. ", "victim n. ", "victory n. ", "video n. ", "view n., v. ", "village n. ", "violence n. ", "violent adj. ", "violently adv. ", "virtually adv. ", "virus n. ", "visible adj. ", "vision n. ", "visit v., n. ", "visitor n. ", "vital adj. ", "vocabulary n. ", "voice n. ", "volume n. ", "vote n., v. ", "wage n. ", "waist n. ", "wait v. ", "waiter, waitress n. ", "wake (up) v. ", "walk v., n. ", "walking n. ", "wall n. ", "wallet n. ", "wander v., n. ", "want v. ", "war n. ", "warm adj., v. ", "warmth n. ", "warn v. ", "warning n. ", "wash v. ", "washing n. ", "waste v., n., adj. ", "watch v., n. ", "water n. ", "wave n., v. ", "way n. ", "we pron. ", "weak adj. ", "weakness n. ", "wealth n. ", "weapon n. ", "wear v. ", "weather n. ", "web n. ", "website n. ", "wedding n. ", "Wednesday n. (abbr. Wed., Weds.) ", "week n. ", "weekend n. ", "weekly adj. ", "weigh v. ", "weight n. ", "welcome v., adj., n., exclamation ", "well adv., adj., exclamation ", "well known  know ", "well known adj. ", "west n., adj., adv. ", "western adj. ", "wet adj. ", "what pron., det. ", "whatever det., pron. ", "wheel n. ", "when adv., pron., conj. ", "whenever conj. ", "where adv., conj. ", "whereas conj. ", "wherever conj. ", "whether conj. ", "which pron., det. ", "while conj., n. ", "whilst conj. (especially BrE) ", "whisper v., n. ", "whistle n., v. ", "white adj., n. ", "who pron. ", "whoever pron. ", "whole adj., n. ", "whom pron. ", "whose det., pron. ", "why adv. ", "wide adj. ", "widely adv. ", "width n. ", "wife n. ", "wild adj. ", "wildly adv. ", "will modal v., n. ", "willing adj. ", "willingly adv. ", "willingness n. ", "win v. ", "wind /w?nd/ n. ", "wind /wa?nd/ v. ", "wind sth up ", "window n. ", "wine n. ", "wing n. ", "winner n. ", "winning adj. ", "winter n. ", "wire n. ", "wise adj. ", "wish v., n. ", "with prep. ", "withdraw v. ", "within prep. ", "without prep. ", "witness n., v. ", "woman n. ", "wonder v. ", "wonderful adj. ", "wood n. ", "wooden adj. ", "wool n. ", "word n. ", "work v., n. ", "worker n. ", "working adj. ", "world n. ", "worried adj. ", "worry v., n. ", "worrying adj. ", "worse, worst  bad ", "worship n., v. ", "worth adj. ", "would modal v. ", "wound n., v. ", "wounded adj. ", "wrap v. ", "wrapping n. ", "wrist n. ", "write v. ", "writer n. ", "writing n. ", "written adj. ", "wrong adj., adv. ", "wrongly adv. ", "yard n. ", "yawn v., n. ", "yeah exclamation ", "year n. ", "yellow adj., n. ", "yes exclamation, n. ", "yesterday adv., n. ", "yet adv., conj. ", "you pron. ", "young adj. ", "your det. ", "Yours faithfully (BrE) ", "yours pron. ", "Yours sincerely (BrE) ", "Yours Truly (NAmE) ", "yourself pron. ", "youth n. ", "zero number ", "zone n."];
displayItems();
changeListLength();

var indexLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
var moreResults = [];
var moreLength = indexLetters.length;
var firstWords = [];
var firstWordPositions = [];
var indexLetterPosition;
var indexHtmlElement;
var matchedLetterTop;
var indexLetterTops = [];
//provisional re-indexing
//http://stackoverflow.com/a/10849453/1973361

// loop through the array of items
for (var i = 0; i < moreLength; i++) {  //loop through the array of items

    function filter(letter) {           //find a letter
      var results = [];                 // store the results here
      var len = items.length;           // determine the length of the items array
      for (var x = 0; x < len; x++) {   // loop through the entire array
        if (items[x].indexOf(letter) === 0) results.push(items[x]);  // if the selected item starts with the selected letter push it to the results
      }
      return results;                   //return the results
    }

    moreResults[i] = filter(indexLetters[i]);   //store the results (apple, ankle, artificial...) in the array named more results

    firstWords[i] = moreResults[i][0];          //grab the first word (from the list of words starting with a letter -- apple)

};

// loop through the list of first words
for (var i = 0; i < firstWords.length; i++) {

    indexLetterPosition = i;                                // store the current loop position (used to reference the letter in the alphabet)**change this to the letter in the index(procedurally generate the index, don't use the current static one) 
    firstWordPositions[i] = items.indexOf(firstWords[i])    // search the array for the current "first word"

    $('.items .' + firstWordPositions[i]).attr('id','index' + indexLetterPosition); //tag the items in the list with an ID for easy referencing
    indexHtmlElement = $('#index' + indexLetterPosition);                           //store the curent index position **could be condensed
    if (indexHtmlElement.length) {                                                  // if there is a word beginning with this letter
        indexLetterTops[i] = indexHtmlElement.position().top;                       // set where the top of it is currently
    }
    else {                                                                          //otherwise
        indexLetterTops[i] = 'undefined';                                           //just put in undefined as its current position
    }    
};

var indexingArray = [];
indexingArray[0] = []; //letters
indexingArray[1] = []; //positions

indexingArray[0] = indexLetters;
indexingArray[1] = indexLetterTops;

//replace inview 
var scrollingItems = function(){

    //loop through and check if any index items are in there
    //if there are  3 or less index positions in view and one or more outside of view
    //scroll the highlighter to the top element
    //and expand its height to encompass all of those that are visible
for (var i = 0; i < indexingArray[1].length; i++) {
    var currentLetterInt = i;
    var currentLetterTop = indexingArray[1][currentLetterInt];
    var currentLetter = indexingArray[0][currentLetterInt];
    var nextLetterInt = currentLetterInt + 1;
    var nextLetterTop = indexingArray[1][nextLetterInt];

    if (isNaN(currentLetterTop)) { //if the current letter position isn't
        //problems
        return;                     //get out of here
    }
    while (isNaN(nextLetterTop) && nextLetterInt < indexingArray[1].length ) {
        //more problems
        nextLetterInt++;
        nextLetterTop = indexingArray[1][nextLetterInt];
    };
    if (itemsScrollTop < currentLetterTop) {
        return;
    }
    if (itemsScrollTop >= currentLetterTop && itemsScrollTop < nextLetterTop) {
        var matchedLetterTop = $('.alphabet .index' + currentLetterInt).position().top;    //finds the top position of the corresponding index item
        fluidHighlighter(matchedLetterTop)                                  //animate the index highlighter
    };
};

}

var oldPosition;
var oldHeight;

var fluidHighlighter = function(newPosition, newHeight){ //add speed maybe?

    var runHeight = function() {
        if ( (newHeight) && newHeight !== oldHeight) {
            indexHighlighter.stop(true,true).animate({
                height: newHeight,
            }, 500);        
        };
    }

    if (newPosition !== oldPosition) {
        indexHighlighter.stop(true,true).animate({
            top: newPosition,
        }, 500, runHeight());
    };
    //indexHighlighter.css('top',matchedLetterTop);

    oldPosition = newPosition
    oldHeight = newHeight

}
