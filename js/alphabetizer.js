
//core features
var alphabetizeOn = true;
var instantEntry = true;

//secodary features
var activeEntry = false;
var multiEntry = false;

var deleteOnClick = false;
var shuffleData = false;
var clearData = false;

//User Interface
var showOptions = true;
var showIndex = false;


//unsupported features
var spaceSplit = false;
var savedItems = false;


// Used variables
var itemsInArray = 0;
var mostRecentItem;
var mostRecentItemPosition;

// Magical array where everything takes place
var items = new Array();


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
var displayItems = function() {

    var $list = $('.list');                                         //the list will will be placed & displayed in .list


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

    $list.html('');                                                 // clear the last content of .list

    $.each(items, function (indexPosition) {                        // iterate through the list
        $list.append('<li class="' + indexPosition + '">' + this + '</li>'); // append a list item for each
    });

// highlite active entry** -note to self, learn how to actually spell highlite 

    mostRecentItemPosition = items.indexOf(mostRecentItem);             // sets most recent item position so that it can be highlited in list *not scoped correctly
    if (activeEntry === true) {                                         // if active entry is on
        $('.list' + ' .' + mostRecentItemPosition).addClass('active');  // make active item visible
    };


//start scrolling the list to current item

    var scrollToPosition = mostRecentItemPosition;                  // set the target to scroll to

    if (scrollToPosition >= 2) {
        scrollToPosition = mostRecentItemPosition - 2;              // subtract 2 positions if possible to give context
    }
    else{
        scrollToPosition = 0                                        // otherwise make it the top
    };

    $('.items').stop(true, true).animate({
        scrollTop: $('li.' + scrollToPosition).position().top   // Animated scroll to recent item http://stackoverflow.com/a/33114021/1973361
    }, 500); 

//    $('.items').scrollTop($('li.' + scrollToPosition).position().top);  // scroll to most recent item non-animated


};

//grab items from input
//This segment listens to and manipulates the input box... and does some stuff with what it grabs
$('.css-input').on('keyup', function (event) {              // listen to each keypress in the input box
    //console.log('length: ' + items.length + ' in array: ' + itemsInArray);
    //console.log(items);

    if (items.length > itemsInArray ) {                 // if an item has been added to the array temporarily
        if (mostRecentItemPosition > -1) {
            items.splice(mostRecentItemPosition, 1);    // delete it now
        };
    };


    var $input = $(event.target);                       // set $input as the source of all of this
    var item = $input.val();                            // take the value of the input box 
    var itemTrimmed = item.trim();                      // trim leading and following white space

    mostRecentItem = itemTrimmed;                       //set most recent item globally
    activeEntry = true;                                 // set active to on


// special cases for certain keys/combos

    if ( (event.which === 13 || event.which === 10) && !event.shiftKey) {   // if enter is pressed
        $input.val(' ');                                                    // empty the input (space prevents placeholder text from displaying)
        itemsInArray++;                                                     // add one to the item counter
        //console.log('enter');
        $('.list' + ' .' + mostRecentItemPosition).removeClass('active');   // remove active class from now inactive item
        activeEntry = false;                                                // set active to off
    };

    if (event.which === 13 && event.shiftKey || event.which === 86 && (event.ctrlKey || event.metakey)) {     // if shift and enter or ctrl v are pressed
    	$('.css-input').addClass('multi-entry');			// Activate multi-entry mode
        $('.hint-box').removeClass('default');              // de-ctivate default hint
        $('.hint-box').addClass('multi');                   // Activate multi-entry hint

    	multiEntry = true;                                  // switch multi entry on
        instantEntry = false;                               // turn off instant entry
    }

    if (event.which === 27) {                               // if escape is pressed
        $('.css-input').removeClass('multi-entry');         // de-activate multi-entry mode
        $('.hint-box').removeClass('multi');                // de-activate multi-entry hint
        $('.hint-box').addClass('default');                 // activate default hint
        multiEntry = false;                                 // switch it off
        instantEntry = true                                 // swich back to instant mode
        var $input = $(event.target);                       // take the reference to the inputbox
        $input.val('');                                     // clear the input box
    }

//adding items to the array
    //with multi-entry
    if (multiEntry === true) {                                  // if multi-entry is active
        if (event.which === 13 && !event.shiftKey) {            // if enter is pressed
            var itemsSplit = itemTrimmed.split(/\r\n|\r|\n/g);  // split at each line break
            $.merge(items, itemsSplit);                         // add split items to array
            //console.log('pushed: ' + itemsSplit);
            $input.val(' ');                                    // empty the input (space prevents placeholder text from displaying)
            itemsInArray++;                                     // increase the "official" item count
            ///console.log('enter')
        };

        if (spaceSplit === true) {                              // unsupported, doesn't really work
            var itemsSplit = itemTrimmed.split(/\s+/g);         // split at each whitespace
            $.merge(items, itemsSplit);                         // add split items to array
            $input.val(' ');                                    // empty the input (space prevents placeholder text from displaying)
            itemsInArray++;            
        };
    }
    else{                                                       //  for evrything else
            var itemsSplit = itemTrimmed.split(/\r\n|\r|\n/g);  // split at each line break
            $.merge(items, itemsSplit);                         // add split items to array
//        items.push(itemTrimmed);// just add trimed items
    }


    
    displayItems();                                         // display all of the items
    //console.log(items);
    //console.log('-----'); 

});

$('.css-input').on('keydown', function (event) {            // listen to each keydown in the input box
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
            //$(this).html('<a href="#undid">undo</a>');    // add undo link
        });
    }
};

//option Checkbox actions
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
    $input.val('');                         // empty the input
    displayItems();                         // display items
});


//some alphabetization code repurposed from
//http://stackoverflow.com/a/25431980
//http://stackoverflow.com/a/9645447



// options dropdown
var scrollOptions = function(){
      if ($(".options-head .arrow").hasClass('unpressed')) {        // if the arrow was unpressed
        $(".options-head .arrow").removeClass("unpressed");         // remove the unpressed class
        $(".options-head .arrow").addClass("pressed");              // add the pressed class
        $(".options-head").removeClass("inert");                    // remove the inert(unused) class
        $( ".options").stop(true, true).slideDown();                // slide down the options
        showOptions = true;                                         // toggle them as shown
      }
      else {                                                        // otherwise (if the arrow was pressed)
        $(".options-head .arrow").removeClass("pressed");           // remove pressed class
        $(".options-head .arrow").addClass("unpressed");            // add unpressed class
        $(".options-head").addClass("inert");                       // add inert class
        $( ".options" ).stop(true, true).slideUp();                 // slide the options away
        showOptions = false;                                        // toggle them as hidden
      };

}

    $('.options-head').click(function () {                          // when the options header is clicked
        scrollOptions();
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
//small height = 500px
var windowHeight = $(window).height();                              // grab window height
var windowWidth = $(window).width();                                // grab window width
var headerHeight = $('.row.first').height();                        // grab height of the header
var footerHeight = $('footer').height();                            // grab height of the footer
var itemsHeight = windowHeight - (headerHeight + footerHeight);     // calculate available height for the items
var shortDisplayHeight = 500;                                       // set the threshold for short display - note to self learn how to spell threshold
var superShortDisplayHeight = 400;                                  // set threshold for super-small display
var shortDisplay = false;                                           // short display mode?
var thinDisplayWidth = "64.063em";                                  // set threshold for non-desktop media query
var thinDisplay ;                                                    // thin display mode?

// function which controls javascript based responsiveness
// called on load and on window resize
var responsiveWindow = function(){
    
    thinDisplay = Modernizr.mq('(max-width: ' + thinDisplayWidth +')'); // check if it's true with modernizr.mq

    if (windowHeight < shortDisplayHeight) {    // if the window is lower than the threshold for short display
        shortDisplay = true;                    // set it into short mode
    }
    else{                                       // otherwise
        shortDisplay = false;                   // keep it in tall mode
    };

    if (windowHeight < shortDisplayHeight && windowHeight > superShortDisplayHeight) {      // if the window is between short and super short
        $('.items').css('max-height', itemsHeight - 45 + 'px');                             // set the height of items accordingly **figure out where that 40px comes from maybe?
    };

    if (windowHeight < superShortDisplayHeight) {      // if the display is super short 
        $('.items').css('max-height', '185px');        // set the height of items list to minimum of 185
    };

    if (windowHeight > shortDisplayHeight) {                        // if the display is normal sized
        $('.items').css('max-height', itemsHeight - 100 + 'px');    // set the height of items accordingly ** figure out where the extra 100 are from...
    };

    if (thinDisplay === true) {
        showOptions = false;
    };

/*
    if (thinDisplay === true) {         // if the media query for non-desktop width is hit
        if (showOptions === true) {
            showOptions = false;
            console.log('what');
            scrollOptions();

        };
    }
    else{
        if (showOptions === false) {
            showOptions = true;
            scrollOptions();
        };

    }
*/

};



$( window ).resize(function() {                                     // on window resize
    windowHeight = $(window).height();                              // reset window height 
    windowWidth = $(window).width();                                // reset window width
    headerHeight = $('.row.first').height();                        // reset header height 
    footerHeight = $('footer').height();                            // reset footer height
    itemsHeight = windowHeight - (headerHeight + footerHeight);     // reset height available for items
    responsiveWindow();                                             // re-run the responsive function

});


responsiveWindow();         // run the responsive function







//scroll functions

$(window).scroll(function() {
    if (thinDisplay && $(window).scrollTop() > 0 && showOptions === true ) {
        scrollOptions();
    };
});