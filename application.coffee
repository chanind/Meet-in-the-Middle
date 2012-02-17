window.MeetInTheMiddle = 
  setup: ->
    @geocoder = new google.maps.Geocoder()
    document.addEvent 'domready', =>
      new OverText('js_place1')
      new OverText('js_place2')
      @loadMap()
      $('js_searchform').addEvent 'submit', (evt) =>
        evt.stop()
        @performSearch()
  loadMap: ->
    mapOptions = 
      center: new google.maps.LatLng(-34.397, 150.644)
      zoom: 11
      mapTypeId: google.maps.MapTypeId.ROADMAP
    @map = new google.maps.Map($('js_map'), mapOptions)
    @infoWindow = new google.maps.InfoWindow()
    @placesService = new google.maps.places.PlacesService(@map)
    google.maps.event.addListener @map, 'dragend', => @loadPlaces()
    google.maps.event.addListener @map, 'zoom_changed', => @loadPlaces()
    document.body.addEvent 'mouseover', =>
      @hlmarker.setMap(null) if @hlmarker
  
  performSearch: ->
    @hideErrors()
    address1 = $('js_place1').value.trim()
    address2 = $('js_place2').value.trim()
    if address1 == '' || address2 == ''
      @error("You can't leave place1 or place2 blank")
    else
      @geocode address1, (loc1) =>
        if loc1
          @geocode address2, (loc2) =>
            if loc2
              @searchNearCenter(loc1, loc2) 
            else
              @error("Can't find #{address2}")
        else
          @error("Can't find #{address1}")
  
  searchNearCenter: (loc1, loc2) ->
    $('js_results').setStyle('visibility', 'visible')
    @centerMarker.setMap(null) if @centerMarker
    centerLat = (loc1.lat() + loc2.lat()) / 2
    centerLng = (loc1.lng() + loc2.lng()) / 2
    @centerPoint = new google.maps.LatLng(centerLat, centerLng)
    @map.setCenter @centerPoint
    @map.setZoom 11
    @centerMarker = new google.maps.Marker
      map: @map
      position: @centerPoint
      icon: 'purple.png'
    @loadPlaces()
    
  loadPlaces: ->
    if @placeMarkers
      @placeMarkers.each (marker) => marker.setMap(null)
    @placeMarkers = []
    $('js_list').empty()
    request = 
      bounds: @map.getBounds()
      types: ['restaurant','movie_theater', 'bowling_alley', 'bakery', 'cafe', 'zoo']
    @placesService.search request, (results, status) =>
      if status == google.maps.places.PlacesServiceStatus.OK
        results.each (place) =>
          marker = new google.maps.Marker
            map: @map
            position: place.geometry.location
          @placeMarkers.push(marker)
          listElmWrapper = new Element('div').inject($('js_list'))
          listElm = new Element('div.resultelm').inject(listElmWrapper)
          new Element('img', {src: place.icon}).inject(listElm)
          new Element('div.header', {text: place.name}).inject(listElm)
          new Element('div.types', {text: place.types.join(', ')}).inject(listElm)
          new Element('div.rating', {text: "rating: #{place.rating} / 5"}).inject(listElm)
          showPopup = () =>
            @infoWindow.setContent(listElmWrapper.innerHTML)
            @infoWindow.open(@map, marker)
          google.maps.event.addListener marker, 'click', showPopup
          listElm.addEvent 'click', showPopup
          listElm.addEvent 'mouseover', (evt) =>
            evt.stop()
            @hlmarker.setMap(null) if @hlmarker
            @hlmarker = new google.maps.Marker
              map: @map
              position: marker.getPosition()
              icon: 'yellow.png'
              zIndex: 1000
      else if  status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS
        $('js_list').grab(new Element('div', {text: '0 results :('})) 
  
  hideErrors: ->
    $('js_errors').setStyle('display', 'none')
    
  error: (msg) ->
    $('js_errors').innerHTML = msg
    $('js_errors').setStyle('display', 'block')
  
  geocode: (address, callback) ->
    @geocoder.geocode {'address': address}, (results, status) =>
      if status == google.maps.GeocoderStatus.OK
        callback(results[0].geometry.location)
      else
        callback(false)  
  
MeetInTheMiddle.setup()
