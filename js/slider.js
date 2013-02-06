/* ======================================================================

	STEAM SALE SLIDER

====================================================================== */

$(function(){

/* ======================================================================
	SOME SETTINGS
====================================================================== */
var todaysDeals = $("#todays_deals");
var yesterdaysDeals = $("#yesterdays_deals");
var sliderContainer = $("#slider_feature");
var sliderLeft = $("#slider_left");
var sliderRight = $("#slider_right");
var prevButton = $("#slide_prev");
var nextButton = $("#slide_next");

/* ======================================================================
	LOAD JSON SETTINGS
====================================================================== */
var deals_today,
		deals_yesterday,
		slideWidth,
		darkSlideWidth;

// load json file via $.getJSON
$.getJSON('json/slider_settings.json', function(data){

	// overwrite variables with information from json file
	deals_today = data.slides_today;
	deals_yesterday = data.slides_yesterday;
	slideWidth = data.settings.slide_width;
	darkSlideWidth = data.settings.darkslide_width;

	// These randomise today and yesterdays deals, but doesn't mix them.
	deals_today = fisherYates(deals_today);
	deals_yesterday = fisherYates(deals_yesterday);

	// Populate slides
	populateToday();
	populateYesterday();
	populateSlides();

});

// create an empty array for allDeals.
// this gets populated as the small buttons are added to our page
var allDeals = [];

// start a count of items
var dealCount = 1;

/* ======================================================================
	RANDOMISE DEAL ARRAYS
====================================================================== */

// http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
function fisherYates ( myArray ) {
  var i = myArray.length;
  if ( i == 0 ) return false;
  while ( --i ) {
     var j = Math.floor( Math.random() * ( i + 1 ) );
     var tempi = myArray[i];
     var tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
   }
   return myArray;
}

/* ======================================================================
	LOAD IN TODAYS DEALS
====================================================================== */

function populateToday(){
	$.each(deals_today, function(i, deal){
		// increment i by one (starts at 1 instead of 0)
		i++;
		var item = renderCapsule(i,deal);
		// add our item to todays deals
		item.appendTo(todaysDeals);
		// push this in to our "allDeals" array for the big slider
		allDeals.push(deal);
	});
}

/* ======================================================================
	LOAD IN YESTERDAYS DEALS
====================================================================== */

function populateYesterday(){
	$.each(deals_yesterday, function(j, deal){
		// increment i by one (starts at 1 instead of 0)
		j++;
		var item = renderCapsule(j,deal);
		// add our item to todays deals
		item.appendTo(yesterdaysDeals);
		// push this in to our "allDeals" array for the big slider
		allDeals.push(deal);
	});
}

/* ======================================================================
	CAPSULE RENDERING FUNCTIONS
	these render the small boxes
====================================================================== */

// renders a capsule containing item image and title
function renderCapsule(j,deal){
	var image = deal.capsule;
	var title = deal.name;
	var item = $("<div class='item' />");
	item.attr("data-num", dealCount);
	dealCount++;
	item.append("<a href='"+deal.link+"' title='"+title+"'><img src='"+image+"' alt='"+title+"' title='"+title+"' /></a>");
	return item;
}

/* ======================================================================
	POPULATE SLIDER FROM JSON
====================================================================== */

function populateSlides(){
	// add each slider item
	var item2right;
	$.each(allDeals, function(k, deal){

		var item = renderSliderItem(k, deal);
		var itemleft = renderDarkSliderItem(k, deal);
		var itemright = renderDarkSliderItem(k, deal);
		sliderContainer.append(item);
		sliderLeft.append(itemleft);
		sliderRight.append(itemright);
		// insert an additional first slide to the end of the right slider
		if(k == 0){
			item2right = renderDarkSliderItem(k, deal);
		}
		// insert an additional final slide at the start
		// also insert one for the left slider
		if(k == allDeals.length-1){
			var item2 = renderSliderItem(k, deal);
			var item2left = renderDarkSliderItem(k, deal);
			sliderContainer.prepend(item2);
			sliderLeft.prepend(item2left);
			sliderRight.append(item2right);
		}
	});

	// Mark first capsule as active
	$(".deal_nav .item[data-num=1]").addClass("active");
}

/* ======================================================================
	RENDER SLIDER ITEMS
====================================================================== */

function renderSliderItem(k, deal){
	k++;
	var item = $("<div class='item' />");
	item.attr("data-num", k);
	item.append("<a href='"+deal.link+"' title='"+deal.name+"'><img src='"+deal.banner+"' alt='"+deal.name+"' title='"+deal.name+"' /></a>");
	// return item
	return item;
}

function renderDarkSliderItem(k, deal){
	k++;
	var item = $("<div class='item' />");
	item.attr("data-num", k);
	item.append("<img src='"+deal.banner_dark+"' alt='"+deal.name+"' title='"+deal.name+"' />");
	// return item
	return item;
}

/* ======================================================================
	SLIDE CONTROLS
====================================================================== */

// Capsule hovers
// Using hoverIntent, adapted by Hernan for .live (usage on appended items)
// https://raw.github.com/hernan/hoverIntent/master/jquery.hoverIntent.js
$(".deal_nav .item").hoverIntent({
	sensitivity: 7,
	interval: 400,
	over: function(){
		// get data-num
		var dataNum = $(this).attr("data-num");
		// set this item to be active
		setActiveThumbnail(dataNum);
		// slideTo();
		slideTo(dataNum);
	},
	out: function(){},
	timeout: 0
});

// Next/Prev Buttons
prevButton.click(function(){
	slideLeft();
});
nextButton.click(function(){
	slideRight();
});

// Do next/previous action when clicking on the slider, too
sliderLeft.click(function(){
	slideLeft();
});
sliderRight.click(function(){
	slideRight();
});

// Capsule active state
function setActiveThumbnail(dataNum){
	$(".deal_nav .item").removeClass("active");
	$(".deal_nav .item[data-num="+dataNum+"]").addClass("active");
}

function slideLeft(){
	if(sliderContainer.is(":animated")){return false;}
	var activeSlide = getActiveSlide();
	if(activeSlide == 1){
		slideOffsetLeft();
	} else {
		slideTo(parseInt(activeSlide) - 1);
	}
}

function slideRight(){
	if(sliderContainer.is(":animated")){return false;}
	var activeSlide = getActiveSlide();
	if(activeSlide == 12){
		slideOffsetRight();
	} else {
		slideTo(parseInt(activeSlide) + 1);
	}
}

function getActiveSlide(){
	var activeSlide = $(".deal_nav .item.active").attr("data-num");
	return activeSlide;
}

function slideTo(slideNum){
	// move main slider
	var offset = parseInt(slideNum) * slideWidth;
	sliderContainer.stop().animate({"left": "-"+offset+"px"}, 500);
	// move left slider
	var leftOffset = (parseInt(slideNum) * darkSlideWidth) - darkSlideWidth;
	sliderLeft.stop().animate({"left": "-"+leftOffset+"px"}, 500);
	// move right slider
	var rightOffset = (parseInt(slideNum) * darkSlideWidth);
	sliderRight.stop().animate({"left": "-"+rightOffset+"px"}, 500);
	// apply capsule class
	setActiveThumbnail(slideNum);
}

function slideOffsetLeft(){
	// Left Slider
	var sliderLeftInitial = darkSlideWidth * allDeals.length;
	sliderLeft.css("left", "-"+sliderLeftInitial+"px");
	var leftOffset = darkSlideWidth * 11;
	sliderLeft.stop().animate({"left": "-"+leftOffset+"px"}, 500);
	// Right Slider
	sliderRight.stop().animate({"left": "0px"}, 500, function(){
		var sliderRightEnd = darkSlideWidth * allDeals.length;
		sliderRight.css({"left": "-"+sliderRightEnd+"px"});
	});
	// Main Slider
	sliderContainer.stop().animate({"left": "0px"}, 500, function(){
		var sliderEnd = slideWidth * allDeals.length;
		sliderContainer.css({"left": "-"+sliderEnd+"px"});
	});
	// Update capsule
	setActiveThumbnail(allDeals.length);
}

function slideOffsetRight(){
	// Right Slider
	sliderRight.css("left", "0");
	sliderRight.animate({"left": "-"+darkSlideWidth+"px"}, 500);
	// Left Slider
	var leftOffset = allDeals.length * darkSlideWidth;
	sliderLeft.stop().animate({"left": "-"+leftOffset+"px"}, 500, function(){
		sliderLeft.css({"left": "0"});
	});
	// Main Slider
	sliderContainer.stop().css({"left": "0px"}).animate({"left": "-"+slideWidth+"px"}, 500);
	// Update capsule
	setActiveThumbnail(1);
}

});