(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.MeetInTheMiddle = {
    setup: function() {
      this.geocoder = new google.maps.Geocoder();
      return document.addEvent('domready', __bind(function() {
        new OverText('js_place1');
        new OverText('js_place2');
        this.loadMap();
        return $('js_searchform').addEvent('submit', __bind(function(evt) {
          evt.stop();
          return this.performSearch();
        }, this));
      }, this));
    },
    loadMap: function() {
      var mapOptions;
      mapOptions = {
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map($('js_map'), mapOptions);
      this.infoWindow = new google.maps.InfoWindow();
      this.placesService = new google.maps.places.PlacesService(this.map);
      google.maps.event.addListener(this.map, 'dragend', __bind(function() {
        return this.loadPlaces();
      }, this));
      google.maps.event.addListener(this.map, 'zoom_changed', __bind(function() {
        return this.loadPlaces();
      }, this));
      return document.body.addEvent('mouseover', __bind(function() {
        if (this.hlmarker) {
          return this.hlmarker.setMap(null);
        }
      }, this));
    },
    performSearch: function() {
      var address1, address2;
      this.hideErrors();
      address1 = $('js_place1').value.trim();
      address2 = $('js_place2').value.trim();
      if (address1 === '' || address2 === '') {
        return this.error("You can't leave place1 or place2 blank");
      } else {
        return this.geocode(address1, __bind(function(loc1) {
          if (loc1) {
            return this.geocode(address2, __bind(function(loc2) {
              if (loc2) {
                return this.searchNearCenter(loc1, loc2);
              } else {
                return this.error("Can't find " + address2);
              }
            }, this));
          } else {
            return this.error("Can't find " + address1);
          }
        }, this));
      }
    },
    searchNearCenter: function(loc1, loc2) {
      var centerLat, centerLng;
      $('js_results').setStyle('visibility', 'visible');
      if (this.centerMarker) {
        this.centerMarker.setMap(null);
      }
      centerLat = (loc1.lat() + loc2.lat()) / 2;
      centerLng = (loc1.lng() + loc2.lng()) / 2;
      this.centerPoint = new google.maps.LatLng(centerLat, centerLng);
      this.map.setCenter(this.centerPoint);
      this.map.setZoom(11);
      this.centerMarker = new google.maps.Marker({
        map: this.map,
        position: this.centerPoint,
        icon: 'purple.png'
      });
      return this.loadPlaces();
    },
    loadPlaces: function() {
      var request;
      if (this.placeMarkers) {
        this.placeMarkers.each(__bind(function(marker) {
          return marker.setMap(null);
        }, this));
      }
      this.placeMarkers = [];
      $('js_list').empty();
      request = {
        bounds: this.map.getBounds(),
        types: ['restaurant', 'movie_theater', 'bowling_alley', 'bakery', 'cafe', 'zoo']
      };
      return this.placesService.search(request, __bind(function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          return results.each(__bind(function(place) {
            var listElm, listElmWrapper, marker, showPopup;
            marker = new google.maps.Marker({
              map: this.map,
              position: place.geometry.location
            });
            this.placeMarkers.push(marker);
            listElmWrapper = new Element('div').inject($('js_list'));
            listElm = new Element('div.resultelm').inject(listElmWrapper);
            new Element('img', {
              src: place.icon
            }).inject(listElm);
            new Element('div.header', {
              text: place.name
            }).inject(listElm);
            new Element('div.types', {
              text: place.types.join(', ')
            }).inject(listElm);
            new Element('div.rating', {
              text: "rating: " + place.rating + " / 5"
            }).inject(listElm);
            showPopup = __bind(function() {
              this.infoWindow.setContent(listElmWrapper.innerHTML);
              return this.infoWindow.open(this.map, marker);
            }, this);
            google.maps.event.addListener(marker, 'click', showPopup);
            listElm.addEvent('click', showPopup);
            return listElm.addEvent('mouseover', __bind(function(evt) {
              evt.stop();
              if (this.hlmarker) {
                this.hlmarker.setMap(null);
              }
              return this.hlmarker = new google.maps.Marker({
                map: this.map,
                position: marker.getPosition(),
                icon: 'yellow.png',
                zIndex: 1000
              });
            }, this));
          }, this));
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          return $('js_list').grab(new Element('div', {
            text: '0 results :('
          }));
        }
      }, this));
    },
    hideErrors: function() {
      return $('js_errors').setStyle('display', 'none');
    },
    error: function(msg) {
      $('js_errors').innerHTML = msg;
      return $('js_errors').setStyle('display', 'block');
    },
    geocode: function(address, callback) {
      return this.geocoder.geocode({
        'address': address
      }, __bind(function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          return callback(results[0].geometry.location);
        } else {
          return callback(false);
        }
      }, this));
    }
  };
  MeetInTheMiddle.setup();
}).call(this);
