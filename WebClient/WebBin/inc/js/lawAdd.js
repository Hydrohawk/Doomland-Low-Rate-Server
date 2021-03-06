;(function(){
	var LawAdd = function(){
		this.LawAdd = new Object();
		this.username = localStorage.getItem("username");
		this.authtoken = localStorage.getItem("authtoken");
		this.errors = '';
		this.logicDraft;
		this.ConditionCountModularly = 10;
		this.OptionEmpty = new Object();
		this.districtActive = false;
	}

	LawAdd.prototype.saveLaw = function(){

		Promise.resolve({
			this : this
		})
		.then(this.Validation)
		.then(this.PromiseAjax)
		.then(function(obj){
			return new Promise(function(resolve,reject){
				obj.data = {
					url : APPIQUERYURL+"/api/v1/laws",
					type : 'GET',
					data : {}
				};
				return resolve(obj);
			})
		})
		.then(this.PromiseAjax)
		.then(function(obj){
			return new Promise(function(resolve,reject){
				var lawid = null;
				for(var i = 0; i<obj.data.length; i++){
					if(obj.data[i].ProposingUser == obj.this.username && obj.data[i].InEffect == false){
						lawid = obj.data[i].Guid;
					}
				}
				location.href  = "../laws.html?lawid=" + lawid;
			})
		})
		.catch(function(err){
			console.log(err);
		});
	}

	LawAdd.prototype.Validation = function(obj){
		return new Promise(function(resolve,reject){

			var data = obj.this.LawAdd,
				_this = obj.this;

			_this.errors = ''

			var data_form = $("#law-addlaw-form :input").serializeArray();

			//Insert validation of input
			var username = _this.username, //needs real username
				authtoken = _this.authtoken, //needs real token
				title =  $('#law-add-title').val(),
				description =  $('#law-add-reasoning').val();

			if(_this.isNullOrEmpty(title) || _this.isNullOrEmpty(description))
			{
				_this.errors += "You must complete the form.<br>";
			}

			if(title.length >= 50){
				_this.errors += "Your title is too long.<br>";
			}

			if(_this.errors){

				variables.showError(_this.errors);
				return reject(_this.errors);

			}else{

				data.url = APPIQUERYURL+'/api/v1/laws/addlaw?title='+title+'&description='+description+'&username='+username+'&authtoken='+authtoken;
				data.description = JSON.stringify(description);

				var sending_data = {};

				if($('#law-add-graph #graph-data').length && $('#law-add-graph #graph-data').val() != '' &&  $('#law-add-graph #graph-data').val() != null){


					var lawAddGraph = JSON.parse($('#law-add-graph #graph-data').val());
						var Keys = [];
						for(k in lawAddGraph.variables){
							Keys.push(lawAddGraph.variables[k].split('/'));
						}

					sending_data.Graph  = {
						Keys: Keys,
						TimeMin: lawAddGraph.time_start,
						TimeMax: lawAddGraph.time_end,
						Title: lawAddGraph.title
					};
				}

				var fieldId = $(".district-controls-wrapper").attr("data-fieldid");
				if( fieldId != undefined && fieldId != "" ){
					variables.setDistrict( callAddLaw );
				} else {
					callAddLaw();
				}

				function callAddLaw(){
					if($("#main-map").css('display') != 'none' && $('#map-data').length && $('#map-data').val() != '' &&  $('#map-data').val() != null){
						sending_data.Map = JSON.parse($('#map-data').val());
						if( _this.districtActive ) {
							sending_data.Map.layerSelected = "ProposedDistricts";
							sending_data.District = ECO.MINIMAP.GetZone();
						}
					}

					sending_data  = JSON.stringify(sending_data);
					data.data = sending_data;
					data.type = "POST";
					obj.data = data;
					return resolve(obj);
				}
			}
		});
	}

	LawAdd.prototype.isNullOrEmpty = function(str){
		return (str == "" || str == null || typeof str == 'undefinied');
	}

	LawAdd.prototype.isInt = function(n){
		return n % 1 === 0;
	}

	LawAdd.prototype.logicDraftCall = function(t){
		t = t || true;
		var _this = this,
			username = _this.username,
			authtoken = _this.authtoken;

		Promise.resolve({
			data : {
				url : APPIQUERYURL+'/api/v1/laws/logicDraft?username='+username+'&authtoken='+authtoken,
				data : {},
				type : 'GET'
			},
			this : this
		}).then(this.PromiseAjax)
		.then(function(obj){
			return new Promise(function(resolve,reject){
				if(t){
					$(".low-boxs").html("");
					_this.districtActive = false;
					_this.logicDraft = obj.data;
					_this.SectionBoxs($(_this.logicDraft.FormatString));
					console.log(obj.data);
				}else{
					_this.logicDraft = obj.data;
				}
				return resolve(obj);
			})
		}).then(function(obj){
			return new Promise(function(resolve,reject){
				for(var i = 0; i < $("section").length; i++) {
					$($("section")[i]).addClass(_this.checkSectionText($("section")[i]));
				}
			})
		})
		.catch(function(err){
			console.log(err);
		});

	}

	LawAdd.prototype.SectionBoxs = function(formatString){
		var _this = this;

		for (var i = 0; i < formatString.length; i++) {

			var title = $(formatString[i]).attr('title');

			if($(formatString[i]).prop('tagName') == 'SECTION' && title){
				_this.Section(i, title, $(formatString[i])[0].innerHTML);
			}
		}

		_this.ConditionCount = 0;
		_this.ConditionOtionHide();

	}

	LawAdd.prototype.Section = function(sectionId, title, formatString){
		var _this = this,
			html = '';

		html+='<div class="row low-box beginSection1" data-sectionId="'+sectionId+'">';

			html+='<div class="col-md-7 beginSection1-desc">';
				html+='<div class="col-md-12 beginSection1-title" style="font-weight: bold;color: #4A8235;">'+title+'</div>';
				html+='</div>';
			html+='</div>';
		html+='</div>';
		$('.low-boxs').append(html);
		_this.RecursionChild($('.beginSection1[data-sectionId='+sectionId+'] .beginSection1-desc'), formatString, _this.logicDraft);
		_this.Style();
	}

	LawAdd.prototype.RecursionChild = function(element, formatString, obj, delet_button){
		var _this = this;

		if( formatString == '<this type="districtEditor">' ) {
			var fieldId = obj.FieldId;

			if( _this.districtActive == false ) {
				setTimeout(function(){
					$('.fancy-add-district').trigger("click");
					$(".district-controls-wrapper").attr("data-fieldId", fieldId);
					ECO.MINIMAP.setDistrictColor(0, "#ffffff");

					variables.getDistrict( fieldId, function(obj){
						for(var i in obj.data.DistrictMetadata) {

							var id = obj.data.DistrictMetadata[i].ID;
							var name = obj.data.DistrictMetadata[i].Name;
							var rgb = "rgb("+obj.data.DistrictMetadata[i].R+","+obj.data.DistrictMetadata[i].G+","+obj.data.DistrictMetadata[i].B+")";

							$(".district-item.active").removeClass("active");
							$(".add-new-district-button").before('<div class="district-item active" data-id="'+id+'" style="background:'+rgb+'""><i class="remove_district_item fa fa-times" aria-hidden="true"></i><input type="text" placeholder="Title" class="district-name-input" value="'+name+'"><input type="button" class="eco-button district-button" value="Color"></div>');
							window.mapColorPicker.setRgb({
								r:obj.data.DistrictMetadata[i].R,
								g:obj.data.DistrictMetadata[i].G,
								b:obj.data.DistrictMetadata[i].B
							});
							$(".district-item.active").removeClass("active");
						}
						if( obj.data.DistrictMap != undefined ) {
							ECO.MINIMAP.SetZone(obj.data.DistrictMap);
						}
					});
				}, 700);
				_this.districtActive = true;
			}
		} else {
			if( _this.districtActive == false ) {
				$('.fancy-remove-district').trigger("click");
				$('.remove-map').trigger("click");
			}
		}

		element.append(formatString);

		var x1 = element.find('child');
		var x2 = element.find('this[type="list"]');
		var x3 = element.find('this[type="dropDown"]');
		var x4 = element.find('this[type="number"]');
		var x5 = element.find('this[type="string"]')
		if(x3.length){
			for(var i = 0; i < x3.length; i++){
				_this.dropDown($(x3[i]), obj);

				if(delet_button){
					$(x3[i]).append('<i class="remove_action_element fa fa-times" aria-hidden="true"></i>');
				}
			}
		}

		if(x1.length){
			for(var i = 0; i < x1.length; i++){
				var child = $(x1[i]).attr('field');

				if(obj[child] && obj[child].FormatString){

					if(obj[child].FirstElementTitle){

						if(obj[child].Elements.length > 0){
							$(x1[i]).append('<span>' + obj[child].FirstElementTitle + '</span>');
						}
					}

					_this.RecursionChild($(x1[i]), obj[child].FormatString, obj[child]);
				}
			}
		}

		if(x2.length){
			for(var i = 0; i < x2.length; i++){

				for(var j = 0; j < obj.Elements.length; j++){

					var html = '<this class="element" data-index="'+j+'" data-fieldid="'+obj.FieldId+'" '+(obj.MinElements!==undefined?' data-minelements="'+obj.MinElements+'"':"")+'>';

						if((obj.OtherElementsTitle == 'or' || obj.OtherElementsTitle == 'and') && j > 0){
							html+= '<br><span class="laws-operator">'+obj.OtherElementsTitle+'</span>';
						}


						var split = obj.Elements[j].FormatString.split("\n");

						if(split.length > 1){
							html+= split[0]+'<div class="then">'+split[1]+'</div>';
						}else{
							html+= obj.Elements[j].FormatString;
						}

						if(obj.OtherElementsTitle == 'or' || obj.OtherElementsTitle == 'and'){
							if(obj.Elements.length > obj.MinElements){
								html+= '<i class="remove_action_element fa fa-times" aria-hidden="true"></i>';
							}
						}

					html+= '</this>';
					var el = $(html);

					$(x2[i]).append(el);

					_this.RecursionChild(el, '', obj.Elements[j]);
				}

				if(obj.OtherElementsTitle == 'or' || obj.OtherElementsTitle == 'and' || obj.FieldId == "0/0"){
					$(x2[i]).append('<i class="add_action_element fa fa-plus" aria-hidden="true" data-fieldid="'+obj.FieldId+'"></i>');
				}
			}

		}



		if(x4.length){
			for(var i = 0; i < x4.length; i++){
				_this.input($(x4[i]), obj);
			}
		}
		if(x5.length){
			for(var i = 0; i < x5.length; i++){
				_this.textinput($(x5[i]), obj);
			}
		}

	}

	LawAdd.prototype.Style = function(){
		var _this = this;

		var list = $('.element > this[type="dropDown"] >child[field="SelectedData"] > child[field="Conditions"] > this[type="list"]');
		for (var i = 0; i < list.length; i++) {

			var parent = $(list[i]).parents('this[type="list"]')[0];

			if($(parent).css('background-color') == 'rgb(91, 160, 65)'){
				$(list[i]).css('background', '#468230');
			}else if($(parent).css('background-color') == 'rgb(70, 130, 48'){
				$(list[i]).css('background', '#5BA041');
			}

			$(list[i]).css('margin', '20px');
			$(list[i]).css('display', 'block');
			$($(list[i]).parents('.element')[0]).css('display', 'block');
		}

		$('child[field="SelectedData"]').parents('.then').css('padding-bottom', '');
		var then = $('child[field="SelectedData"] > child').parents('.then').css('padding-bottom', '20px');

		$('.beginSection1-desc > section > child > this > child > child').parent().css('margin-bottom', '20px');

		var selectedData = $('child[field="SelectedData"]');
		for (var i = 0; i < selectedData.length; i++) {
			if(!$(selectedData[i]).html()){
				$(selectedData[i]).css('margin-bottom', '0px');
			}
		}

		var arr = $(".element[data-fieldid='0/0']");
		for(i = 0; i < arr.length; i++) {
			var dropDown = $(arr[i]).children("[type=dropDown]");
			var element_select = dropDown.children(".element_select");
			var index = element_select.attr("data-fieldid");

			var parents = $(".element[data-fieldid^='"+index+"']");
			for(j = 0; j < parents.length; j++) {
				var parent = parents[j];
				if($(parent).attr('data-fieldid').split('/').length == 5) {

					var section = $(parent).siblings("section").remove();
					$(parent).parent().append(section);
				}
			}

			var MinElements = $(arr[i]).attr("data-minelements");
			if( arr.length > MinElements && $(arr[i]).children('[type="dropDown"]').children(".remove_action_element").length <= 0) {
				$(arr[i]).children("[type=dropDown]").prepend('<i class="remove_action_element fa fa-times remove_action_element_2" aria-hidden="true"></i>');
			}
		}

		$("[field='Condition'] this.element").map(function(j,_if){
			if( $(_if).index() != 0 ) {
				$(_if).html($(_if).html().replace("If", "Otherwise if "));
			}
			if( $(_if).attr("data-minelements") <= $(_if).siblings('.element').length ) {
				$($(_if).find("[type=dropDown]")[0]).append('<i class="remove_action_element fa fa-times" aria-hidden="true"></i>');
			}
			if($(_if).index() == $(_if).siblings().length) {
				var fieldId = $(_if).attr("data-fieldid");
				$(_if).parent().append('<i class="add_action_element fa fa-plus" aria-hidden="true" data-fieldid="'+fieldId+'"></i>');
			}
		})

		$('[field="ElseCondition"]').map(function(index,item){
			$(item).parent().css({"margin":0});
		})


	}

	LawAdd.prototype.dropDown = function(element, obj){
		var _this = this,
			allOptions = obj.AllOptions;

		// if(allOptions.length){
			var html = '<select  class="element_select" data-fieldid="'+obj.FieldId+'" style="display: inline-block;">';
			for (var i = 0; i < allOptions.length; i++) {
				var ID = allOptions[i].ID,
					DisplayName = allOptions[i].DisplayName


				// if(_this.OptionEmpty[ID]){
				// 	ID = '-';
				// 	DisplayName = '-';
				// }else if(obj.SelectedData && obj.Selected.ID == ID){
				// 	if(obj.SelectedData.DisplayString == '-'){
				// 		_this.OptionEmpty[ID] = true;
				// 		ID = '-';
				// 		DisplayName = '-';

				// 		if(obj.Selected.ID == 'Repeal'){
				// 			element.parents('.beginSection1').remove();
				// 		}
				// 	}
				// }

				if(obj.Selected.ID == ID){
					html+= '<option value="'+ID+'" selected>'+DisplayName+'</option>';
				}else{
					html+= '<option value="'+ID+'">'+DisplayName+'</option>';
				}

			}

			html+= '</select>';

			element.prepend(html);
		// }
	}

	LawAdd.prototype.ConditionOtionHide = function(){
		var _this = this;

		$('section select option[value="4"]').show();

		for (var i = 0; i < $('section select option[value="4"]').length; i++) {
			var option = $('section select option[value="4"]')[i];

			var level = $(option).parents('[field=Result]').length + $(option).parents('[field=ElseCondition]').length;

			if(level >= _this.ConditionCountModularly){
				$(option).hide();
			}
		}

		var sections = $('section');
		for(var i = 0; i < sections.length; i++) {
			var section = sections[i];
			var field = $(section).children("child").attr("field");

			if( field == "Result" ) {
				var level = $(section).parents('[field=Result]').length + $(section).parents('[field=ElseCondition]').length;
				$(section).attr("style", "background: rgba(26, 70, 10, " + (55 + level*5)/255 + ");");
			} else {
				//$(section).css({"margin": "-71px 0 0 40px"});
			}
		}
	}

	LawAdd.prototype.input = function(element, obj){
		var _this = this,
			html = '';
			html+='<input type="text" name="sub_value" value="'+obj.Value+'" class="sub_value" data-fieldid="'+obj.FieldId+'" style="width:50px;display: inline-block;">';

		element.append(html);
	}

	LawAdd.prototype.textinput = function(element, obj){
		var _this = this,
			html = '';
			if ( typeof obj.Value == 'undefined') {
				obj.Value = ''
			}
			html+='<input type="text" name="sub_value_string" value="'+obj.Value+'" class="sub_value_string" data-fieldid="'+obj.FieldId+'" style="width:150px;display: inline-block;">';

		element.append(html);
	}

	LawAdd.prototype.addActionElement = function(fieldId){

		var _this = this,
			param = '?username='+_this.username+'&authtoken='+_this.authtoken+'&fieldId='+fieldId;

		Promise.resolve({
			data : {
				url : APPIQUERYURL+'/api/v1/laws/logicDraft/list/add'+param,
				data : {},
				type : 'GET'
			},
			this : this
		}).then(this.PromiseAjax)
		.then(function(obj){

			return new Promise(function(resolve, reject){
				_this.logicDraftCall();
			})

		})
		.catch(function(err){
			console.log(err);
		});
	}

	LawAdd.prototype.removeActionElement = function(index, fieldId){

		var _this = this,
			param = '?username='+_this.username+'&authtoken='+_this.authtoken+'&fieldId='+fieldId+'&index='+index;

		Promise.resolve({
			data : {
				url : APPIQUERYURL+'/api/v1/laws/logicDraft/list/remove'+param,
				data : {},
				type : 'GET'
			},
			this : this
		}).then(this.PromiseAjax)
		.then(function(obj){
			return new Promise(function(resolve, reject){
				_this.logicDraftCall();
			})
		})
		.catch(function(err){
			console.log(err);
		});
	}

	LawAdd.prototype.valueElements = function(fieldId, value){
		var _this = this,
			username = _this.username,
			authtoken = _this.authtoken;

		Promise.resolve({
			data : {
				url : APPIQUERYURL+'/api/v1/laws/logicDraft/dropdown/set?username='+username+'&authtoken='+authtoken+'&fieldId='+fieldId,
				data : JSON.stringify(value),
				type : 'POST'
			},
			this : this
		}).then(this.PromiseAjax)
		.then(function(obj){
			return new Promise(function(resolve, reject){
				_this.logicDraftCall();
			})
		})
		.catch(function(err){
			console.log(err);
		});

	}

	LawAdd.prototype.valueNumber = function(fieldId, value){
		var _this = this,
			username = _this.username,
			authtoken = _this.authtoken;

		Promise.resolve({
			data : {
				url : APPIQUERYURL+'/api/v1/laws/logicDraft/number/set?username='+username+'&authtoken='+authtoken+'&fieldId='+fieldId+'&value='+value,
				data : {},
				type : 'GET'
			},
			this : this
		}).then(this.PromiseAjax)
		.then(function(obj){
			return new Promise(function(resolve, reject){
				_this.logicDraftCall(false);
			})
		})
		.catch(function(err){
			console.log(err);
		});

	}

	LawAdd.prototype.valueString=function(fieldId,value){
		var _this = this,
			username = _this.username,
			authtoken = _this.authtoken;

		Promise.resolve({
			data : {
				url : APPIQUERYURL+'/api/v1/laws/logicDraft/string/set?username='+username+'&authtoken='+authtoken+'&fieldId='+fieldId+'&value='+value,
				data : {},
				type : 'GET'
			},
			this : this
		}).then(this.PromiseAjax)
		.then(function(obj){
			return new Promise(function(resolve, reject){
				_this.logicDraftCall(false);
			})
		})
		.catch(function(err){
			console.log(err);
		});
	}
	// helper functions start
	LawAdd.prototype.PromiseAjax = function(obj){
		return new Promise(function(resolve,reject){
			var _this = obj.this;
			$.ajax({
				url: obj.data.url,
				data: obj.data.data,
				type: obj.data.type,
				contentType: "application/json",
				// dataType: 'json',
				success: function(data){
					obj.data = data;
					return resolve(obj)
				},
				error : function(err){
					variables.showError(err.responseJSON.ExceptionMessage);
					return reject(err);
				}
			});
		});
	}

	LawAdd.prototype.checkSectionText = function(txt) {
		return (!!$(txt).clone().children().remove().end().text().trim().length?"":"proglaw-section-noarrow");
	}

	LawAdd.prototype.bindEvent = function(){
		var _this = this;
		$('#law-addlaw-form').on('submit', function(e) {
			e.preventDefault();
			_this.saveLaw();
		})

		$(document).on('click', '.fancy-add-graph', function(){

			var composer = $("<iframe class='comment-graph' id='graph_composer' src='graph_composer/index.html'></iframe>");
			if($('iframe.comment-graph').length > 0){
				$('.iframe.comment-graph').remove();
			}

			$(".law-discussion-textarea, .propose-graph-button-wrapper").before(composer);
			$(this).hide();

			composer.fadeIn();
			$('.remove-graph').css({'display': 'inline-block', 'margin-right': '17px'}).fadeIn();

		});

		 /* Removing graph */
		$(document).on('click', '.remove-graph', function(){
			$(this).hide();

			$('.fancy-add-graph').html('Add Graph');

			$('.fancy-add-graph').attr('data-action', 'add');

			$('#graph-data').val('');

			$('#graph_composer').remove();

			$('.fancy-add-graph').show();
		})

		$(document).on('click', '.add_action_element', function(){
			var fieldId = $(this).attr('data-fieldid');

			_this.addActionElement(fieldId);
		});

		$(document).on('click', '.remove_action_element', function(){
			var index = $(this).parents('.element').attr('data-index'),
				fieldId = $(this).parents('.element').attr('data-fieldid');

			_this.removeActionElement(index, fieldId);
		});

		$(document).on('change','.element_select', function(){
			var fieldId = $(this).attr('data-fieldid');

			if($(this).val() != '-'){
				var value = {
						"DisplayName": $(this).find('option[value="'+$(this).val()+'"]').text(),
						"ID": $(this).val()
					};
				_this.valueElements(fieldId, value);
			}
		});

		$(document).on('change','.sub_value', function(){
			var fieldId = $(this).attr('data-fieldid'),
				value = $(this).val();

			if($.isNumeric(value)){
				_this.valueNumber(fieldId, value);
			}else{
				variables.showError('number');
			}
		});


		$(document).on('mousemove','#main-map',function(){
			if(_this.districtActive == true){
				$('.map-tooltip').hide();
			}
		});

		$(document).on('mouseout','#main-map',function(){
			if(_this.districtActive == true){				
				$('.map-tooltip').show();
			}
		});


		$(document).on('change','.sub_value_string',function(){
			var fieldId = $(this).attr('data-fieldid'),
				value = $(this).val();
				if (value != '') {
					_this.valueString(fieldId,value);
				}else{
					variables.showError('can not be empty');
				}
		});

	};

	$(document).ready(function() {
		window.lawadd = new LawAdd();

		// variables.canaddlaw();
		lawadd.logicDraftCall();
		lawadd.bindEvent();
 	});
})()