/*
 * � Copyright IBM Corp. 2012
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 * 
 * http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
 * implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 */

/**
 * Javascript APIs for IBM Connections Community Service.
 * 
 * @module sbt.connections.CommunityService
 */
define(
		[ 'sbt/_bridge/declare', 'sbt/config', 'sbt/lang', 'sbt/connections/core', 'sbt/xml', 'sbt/util', 'sbt/xpath', 'sbt/Cache', 'sbt/Endpoint',
				'sbt/connections/CommunityConstants' ],
		function(declare, cfg, lang, con, xml, util, xpath, Cache, Endpoint, Constants) {

			/**
			 * Community class associated with a community.
			 * 
			 * @class Community
			 */
			var Community = declare("sbt.connections.Community", null, {
				_service : null,
				_id : "",
				data : null,
				fields : {},

				constructor : function(svc, id) {
					this._service = svc;
					this._id = id;
				},
				/**
				 * Loads the community object with the atom entry associated with the community. By default, a network call is made to load the atom entry
				 * document in the community object.
				 * 
				 * @method load
				 * @param {Object}
				 *            [args] Argument object
				 * @param {Boolean}
				 *            [args.loadIt=true] Loads the community object with atom entry document of the community. To instantiate an empty community object
				 *            associated with a community (with no atom entry document), the load method must be called with this parameter set to false. By
				 *            default, this parameter is true.
				 * @param {Function}
				 *            [args.load] The function community.load invokes when the community is loaded from the server. The function expects to receive one
				 *            parameter, the loaded community object.
				 * @param {Function}
				 *            [args.error] Sometimes the load calls fail. Often these are 404 errors or server errors such as 500. The error parameter is
				 *            another callback function that is only invoked when an error occurs. This allows to control what happens when an error occurs
				 *            without having to put a lot of logic into your load function to check for error conditions. The parameter passed to the error
				 *            function is a JavaScript Error object indicating what the failure was. From the error object. one can get access to the javascript
				 *            library error object, the status code and the error message.
				 * @param {Function}
				 *            [args.handle] This callback is called regardless of whether the call to load the community completes or fails. The parameter
				 *            passed to this callback is the community object (or error object). From the error object. one can get access to the javascript
				 *            library error object, the status code and the error message.
				 */
				load : function(args) {					
					this.data = this._service._load(this, args);					
				},
				/**
				 * Updates the community object.
				 * 
				 * @method update
				 * @param {Object}
				 *            [args] Argument object
				 * @param {Function}
				 *            [args.load] The function community.load invokes when the community is loaded from the server. The function expects to receive one
				 *            parameter, the loaded community object.
				 * @param {Function}
				 *            [args.error] Sometimes the load calls fail. Often these are due to bad request like http error code 400 or server errors like http
				 *            error code 500. The error parameter is another callback function that is only invoked when an error occurs. This allows to control
				 *            what happens when an error occurs without having to put a lot of logic into your load function to check for error conditions. The
				 *            parameter passed to the error function is a JavaScript Error object indicating what the failure was. From the error object. one
				 *            can get access to the javascript library error object, the status code and the error message.
				 * @param {Function}
				 *            [args.handle] This callback is called regardless of whether the call to load the community completes or fails. The parameter
				 *            passed to this callback is the community object (or error object). From the error object. one can get access to the javascript
				 *            library error object, the status code and the error message.
				 */
				update : function(args) {
					this._service.updateCommunity(this, args);
				},

				/**
				 * Return the xpath expression for a field in the atom entry document of the community.
				 * 
				 * @method fieldXPathForEntry
				 * @param {String}
				 *            fieldName Xml element name in atom entry document of the community.
				 * @return {String} xpath for the element in atom entry document of the community.
				 */
				fieldXPathForEntry : function(fieldName) {
					return Constants._xpath[fieldName];
				},
				/**
				 * Return the xpath expression for a field in the atom entry of the community within a feed of communities.
				 * 
				 * @method fieldXPathForFeed
				 * @param {String}
				 *            fieldName Xml element name in entry of the community.
				 * @return {String} xpath for the element in entry of the community.
				 */
				fieldXPathForFeed : function(fieldName) {
					return Constants._xpath_communities_Feed[fieldName];
				},
				/**
				 * Return the value of a field in the community entry using xpath expression
				 * 
				 * @method xpath
				 * @param {String}
				 *            path xpath expression
				 * @return {String} value of a field in community entry using the xpath expression
				 */
				xpath : function(path) {
					return this.data && path ? xpath.selectText(this.data, path, con.namespaces) : null;
				},
				/**
				 * Return an array of nodes from a community entry using xpath expression
				 * 
				 * @method xpathArray
				 * @param {String}
				 *            path xpath expression
				 * @return {Object} an array of nodes from a community entry using xpath expression
				 */
				xpathArray : function(path) {
					return this.data && path ? xpath.selectNodes(this.data, path, con.namespaces) : null;
				},
				get : function(fieldName) {
					if (fieldName == "tags") {
						return this._getTags(fieldName);
					}
					return this.fields[fieldName] || this.xpath(this.fieldXPathForEntry(fieldName)) || this.xpath(this.fieldXPathForFeed(fieldName));
				},

				set : function(fieldName, value) {
					this.fields[fieldName] = value;
				},

				remove : function(fieldName) {
					delete this.fields[fieldName];
				},
				_getTags : function(fieldName) {					
					var tagsObj = this.xpathArray(this.fieldXPathForEntry(fieldName));
					var tags = [];					
					for(var count = 1;count < tagsObj.length; count ++){
						var node = tagsObj[count];
						var tag = node.text || node.textContent;
						tags.push(tag);
					}
					return tags;
				},
				getCommunityUuid : function() {
					return this.get("communityUuid");
				},
				getTitle : function() {
					return this.get("title");
				},
				getSummary : function() {
					return this.get("summary");
				},
				getContent : function() {
					return this.get("content");
				},
				getCommunityUrl : function() {
					return this.get("communityUrl");
				},
				getLogoUrl : function() {
					return this.get("logoUrl");
				},
				getTags : function() {
					return this.get("tags");
				},
				setTitle : function(title) {
					this.set("title", title);
				},
				setContent : function(content) {
					this.set("content", content);
				},
				setAddedTags : function(addedTags) {
					this.set("addedTags", addedTags);
				},
				setDeletedTags : function(deletedTags) {
					this.set("deletedTags", deletedTags);
				}

			});

			/**
			 * Member class associated with a community.
			 * 
			 * @class Member
			 */
			var Member = declare("sbt.connections.Member", null, {
				_service : null,
				_id : "",
				data : null,
				memberFields : {},

				constructor : function(svc, id) {
					this._service = svc;
					this._id = id;
				},
				load : function(args) {
					if (!this.data) {
						this.data = this._service._loadMember(this, args);
					}
				},
				fieldXPathForFeed : function(fieldName) {
					return Constants._xpath_member[fieldName];
				},
				fieldXPathForEntry : function(fieldName) {
					return Constants._xpath_community_Members_Feed[fieldName];
				},
				xpath : function(path) {
					return this.data && path ? xpath.selectText(this.data, path, con.namespaces) : null;
				},
				get : function(fieldName) {
					return this.memberFields[fieldName] || this.xpath(this.fieldXPathForEntry(fieldName)) || this.xpath(this.fieldXPathForFeed(fieldName));
				},
				set : function(fieldName, value) {
					this.memberFields[fieldName] = value;
				},
				remove : function(fieldName) {
					delete this.memberFields[fieldName];
				},
				getName : function() {
					return this.get("name");
				},
				setName : function(name) {
					this.set("name", name);
				},
				getRole : function() {
					return this.get("role");
				},
				setRole : function(role) {
					this.set("role", role);
				}
			});
			/**
			 * Community service class associated with the community service of IBM Connections.
			 * 
			 * @class CommunityService
			 * @constructor
			 * @param {Object}
			 *            options Options object
			 * @param {String}
			 *            [options.endpoint=connections] Endpoint to be used by CommunityService.
			 */
			var CommunityService = declare(
					"sbt.connections.CommunityService",
					null,
					{
						_endpoint : null,

						constructor : function(options) {
							options = options || {};
							this._endpoint = Endpoint.find(options.endpoint || 'connections');
						},

						_notifyError : function(error, args) {
							if (args){
								if (args.error)
									args.error(error);
								if (args.handle)
									args.handle(error);
							}
						},
						/**
						 * Get member entry document of a member of a community
						 * 
						 * @method getMember
						 * @param {Object}
						 *            args Argument object
						 * @param {String}
						 *            args.id Id of the member. This can be userId or email of the member.
						 * @param {String/Object}
						 *            args.community This can be either a string representing community id or a community object with its id initialized.
						 * @param {Boolean}
						 *            [args.loadIt=true] Loads the members object with member entry document. If an empty member object associated with a
						 *            community (with no member entry document) is needed, then the load method must be called with this parameter set to false.
						 *            By default, this parameter is true.
						 * @param {Function}
						 *            [args.load] This function is invoked when the member is loaded from the server. The function expects to receive one
						 *            parameter, the loaded member object.
						 * @param {Function}
						 *            [args.error] Sometimes the getMember call fails with bad request such as 400 or server errors such as 500. The error
						 *            parameter is another callback function that is only invoked when an error occurs. This allows to control what happens when
						 *            an error occurs without having to put a lot of logic into your load function to check for error conditions. The parameter
						 *            passed to the error function is a JavaScript Error object indicating what the failure was. From the error object. one can
						 *            get access to the javascript library error object, the status code and the error message.
						 * @param {Function}
						 *            [args.handle] This callback is called regardless of whether the call to get the member completes or fails. The parameter
						 *            passed to this callback is the member object (or error object). From the error object. one can get access to the
						 *            javascript library error object, the status code and the error message.
						 */
						getMember : function(args) {
							// return lang.isArray(id) ? this._getMultiple(id,
							// cb,options) : this._getOne(id,load, cb,options);
							return this._getOneMember(args);
						},

						/**
						 * Get community object associated with a community
						 * 
						 * @method getCommunity
						 * @param {Object}
						 *            args Argument object
						 * @param {String}
						 *            args.id id of the community
						 * @param {Boolean}
						 *            [args.loadIt=true]
						 * @param {Function}
						 *            [args.load]
						 * @param {Function}
						 *            [args.error]
						 * @param {Function}
						 *            [args.handle]
						 */
						getCommunity : function(args) {
							// return lang.isArray(id) ? this._getMultiple(id,
							// cb,options) : this._getOne(id,load, cb,options);
							return this._getOne(args);
						},

						_getOne : function(args) {
							if(args){
								if (typeof args != "object") {
									util.log(Constants.sbtErrorMessages.args_object);
									return;
								}
							}
							var community = null;
							if(args && args.id){
								community = new Community(this, args.id);
							}else{
								community = new Community(this);
							}
							if (args && (args.loadIt == false)) {
								if (args.load) {
									args.load(community);
								}
								if (args.handle) {
									args.handle(community);
								}
							} else {
								this._load(community, args);
							}
							return community;
						},

						_getOneMember : function(args) {
							if (typeof args != "object") {
								util.log(Constants.sbtErrorMessages.args_object);
								return;
							}
							var member = new Member(this, args.id);
							if (args.loadIt == false) {
								if (args.load) {
									args.load(member);
								}
								if (args.handle) {
									args.handle(member);
								}
							} else {
								this._loadMember(member, args);
							}
							return member;
						},

						/*
						 * _getMultiple: function(ids,cb,options) { // For now. Should later use a single call for multiple entries var a = []; for(var i=0; i<ids.length;
						 * i++) { a[i] = this._getOne(ids[i],cb,options); } return a; },
						 */

						_load : function(community, args) {
							if (!(this._checkCommunityId(community, args))) {
								return;
							}
							var _self = this;
							var content = {};
							content.communityUuid = community._id;
							this._endpoint.xhrGet({
								serviceUrl : this._constructCommunityUrl(Constants._methodName.getCommunity),
								handleAs : "text",
								content : content,
								load : function(data) {
									community.data = xml.parse(data);
									if (args.load) {
										args.load(community);
									}
									if (args.handle) {
										args.handle(community);
									}
								},
								error : function(error) {
									_self._notifyError(error, args);

								}
							});

						},

						_loadMember : function(member, args) {
							if (!(this._checkMemberId(member, args))) {
								return;
							}
							var communityId;
							if(!(this._checkCommunityPresence(args, args))){
								return;
							}
							if (!(typeof args.community == "object")) {
								communityId = args.community ;								
							} else {
								if(!(this._checkCommunityObject(args.community, args)) || !(this._checkCommunityId(args.community, args))){
									return;
								}
								communityId = args.community._id;
							}
							var _self = this;
							var content = {
								communityUuid : communityId
							};
							if (this._isEmail(member._id)) {
								content.email = member._id;
							} else {
								content.userid = member._id;
							}
							this._endpoint.xhrGet({
								serviceUrl : this._constructCommunityUrl(Constants._methodName.getMember),
								handleAs : "text",
								content : content,
								load : function(data) {
									member.data = xml.parse(data);
									if (args.load) {
										args.load(member);
									}
									if (args.handle) {
										args.handle(member);
									}
								},
								error : function(error) {
									_self._notifyError(error, args);

								}
							});
						},

						_constructAddMemberRequestBody : function(member) {
							var body = "<entry xmlns=\"http://www.w3.org/2005/Atom\" xmlns:app=\"http://www.w3.org/2007/app\" xmlns:opensearch=\"http://a9.com/-/spec/opensearch/1.1/\" xmlns:snx=\"http://www.ibm.com/xmlns/prod/sn\">";
							body += "<contributor>";
							if (member._id) {
								if (this._isEmail(member._id)) {
									body += "<email>" + xml.encodeXmlEntry(member._id) + "</email>";
								} else {
									body += "<snx:userid xmlns:snx=\"http://www.ibm.com/xmlns/prod/sn\">" + xml.encodeXmlEntry(member._id) + "</snx:userid>";
								}
							}
							body += "</contributor>";
							if (member.memberFields.role) {
								body += "<snx:role xmlns:snx=\"http://www.ibm.com/xmlns/prod/sn\" component=\"http://www.ibm.com/xmlns/prod/sn/communities\">"
										+ xml.encodeXmlEntry(member.memberFields.role) + "</snx:role>";
							}
							body += "</entry>";
							return body;
						},

						_constructCommunityRequestBody : function(community) {
							var body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><entry xmlns=\"http://www.w3.org/2005/Atom\" xmlns:app=\"http://www.w3.org/2007/app\" xmlns:snx=\"http://www.ibm.com/xmlns/prod/sn\">";
							if (!community.fields.title) {
								if (community.getTitle()) {
									body += "<title type=\"text\">" + xml.encodeXmlEntry(community.getTitle()) + "</title>";
								}
							}
							if (!community.fields.content) {
								if (community.getContent()) {
									body += "<content type=\"html\">" + xml.encodeXmlEntry(community.getContent()) + "</content>";
								}else{
									body += "<content type=\"html\"></content>";
								}
							}
							// community title and content are mandatory fields
							// in the request body
							for (key in community.fields) {
								if (key == "title") {
									body += "<title type=\"text\">" + xml.encodeXmlEntry(community.fields.title) + "</title>";
								}
								if (key == "content") {
									body += "<content type=\"html\">" + xml.encodeXmlEntry(community.fields.content) + "</content>";
								}
								if (key == "addedTags") {
									var _concatTags = community.getTags();
									var _addedTags = this._getUniqueElements(community.fields.addedTags);
									for ( var count = 0; count < _addedTags.length; count++) {
										if (_concatTags.indexOf(_addedTags[count]) == -1) {
											_concatTags.push(_addedTags[count]);
										}
									}
									while (_concatTags.length > 0) {
										body += "<category term=\"" + xml.encodeXmlEntry(_concatTags.shift()) + "\"/>";
									}
								}
								if (key == "deletedTags") {
									var _originalTags = community.getTags();
									for ( var len = 0; len < community.fields.deletedTags.length; len++) {
										if (_originalTags.indexOf(community.fields.deletedTags[len]) != -1) {
											_originalTags.splice(_originalTags.indexOf(community.fields.deletedTags[len]), 1);
										}
									}
									while (_originalTags.length > 0) {
										body += "<category term=\"" + xml.encodeXmlEntry(_originalTags.shift()) + "\"/>";
									}
								}
							}
							body += "<category term=\"community\" scheme=\"http://www.ibm.com/xmlns/prod/sn/type\"></category><snx:communityType xmlns:snx=\"http://www.ibm.com/xmlns/prod/sn\">public</snx:communityType></entry>";
							return body;
						},

						_constructCommunityUrl : function(methodName) {
							var authType = "";
							if (this._endpoint.authType == "basic") {
								authType = "";
							} else if (this._endpoint.authType == "oauth") {
								authType = "/oauth";
							} else {
								authType = "";
							}
							if (methodName == Constants._methodName.createCommunity) {
								return con.communitiesUrls["communitiesServiceBaseUrl"] + authType + con.communitiesUrls["createCommunity"];
							}
							if (methodName == Constants._methodName.updateCommunity) {
								return con.communitiesUrls["communitiesServiceBaseUrl"] + authType + con.communitiesUrls["updateCommunity"];
							}
							if (methodName == Constants._methodName.deleteCommunity) {
								return con.communitiesUrls["communitiesServiceBaseUrl"] + authType + con.communitiesUrls["deleteCommunity"];
							}
							if (methodName == Constants._methodName.addMember) {
								return con.communitiesUrls["communitiesServiceBaseUrl"] + authType + con.communitiesUrls["addCommunityMember"];
							}
							if (methodName == Constants._methodName.removeMember) {
								return con.communitiesUrls["communitiesServiceBaseUrl"] + authType + con.communitiesUrls["removeCommunityMember"];
							}
							if (methodName == Constants._methodName.getCommunity) {
								return con.communitiesUrls["communitiesServiceBaseUrl"] + authType + con.communitiesUrls["getCommunity"];
							}
							if (methodName == Constants._methodName.getMember) {
								return con.communitiesUrls["communitiesServiceBaseUrl"] + authType + con.communitiesUrls["getCommunityMember"];
							}

						},

						/**
						 * Create a new community
						 * 
						 * @method createCommunity
						 * @param {Object}
						 *            community Community object
						 * @param {Object}
						 *            [args] Argument object
						 * @param {Boolean}
						 *            [args.loadIt=true]
						 * @param {Function}
						 *            [args.load]
						 * @param {Function}
						 *            [args.error]
						 * @param {Function}
						 *            [args.handle]
						 */
						createCommunity : function(community, args) {
							if (!(this._checkCommunityObject(community, args))) {
								return;
							}
							var headers = {
								"Content-Type" : "application/atom+xml"
							};
							var _self = this;
							this._endpoint.xhrPost({
								serviceUrl : this._constructCommunityUrl(Constants._methodName.createCommunity),
								postData : this._constructCommunityRequestBody(community),
								headers : headers,
								load : function(data, ioArgs) {
									var newCommunityUrl = ioArgs.xhr.getResponseHeader("Location");
									var communityId = newCommunityUrl.substring(newCommunityUrl.indexOf("communityUuid=") + "communityUuid=".length);
									community._id = communityId;
									community.fields = {};
									if (args && args.loadIt != false) {									
										_self._load(community, args);
									} else {
										if (args.load)
											args.load(community);
										if (args.handle)
											args.handle(community);
									}
								},
								error : function(error) {
									_self._notifyError(error, args);
								}
							});
						},
						/**
						 * Update an existing community
						 * 
						 * @method updateCommunity
						 * @param {Object}
						 *            community Community object
						 * @param {Object}
						 *            [args] Argument object
						 * @param {Function}
						 *            [args.load]
						 * @param {Function}
						 *            [args.error]
						 * @param {Function}
						 *            [args.handle]
						 */
						updateCommunity : function(community, args) {
							if (!(this._checkCommunityObject(community, args)) || !(this._checkCommunityId(community, args))) {
								return;
							}
							var _id = community._id;
							var _self = this;
							var headers = {
								"Content-Type" : "application/atom+xml"
							};
							this._endpoint.xhrPut({
								serviceUrl : this._constructCommunityUrl(Constants._methodName.updateCommunity) + "?communityUuid=" + encodeURIComponent(_id),
								putData : this._constructCommunityRequestBody(community),
								headers : headers,
								load : function(data) {
									community.data = xml.parse(data);
									if (args.load)
										args.load(community);
									if (args.handle)
										args.handle(community);
								},
								error : function(error, ioargs) {
									_self._notifyError(error, args);
								}
							});
						},

						/**
						 * Delete an existing community
						 * 
						 * @method deleteCommunity
						 * @param {String/Object}
						 *            community id of the community or the community object.
						 * @param {Object}
						 *            [args] Argument object
						 * @param {Function}
						 *            [args.load]
						 * @param {Function}
						 *            [args.error]
						 * @param {Function}
						 *            [args.handle]
						 */
						deleteCommunity : function(inputCommunity, args) {
							if (!(typeof inputCommunity == "object")) {
								var community = new Community(this, inputCommunity);
								this._deleteCommunity(community, args);
							} else {
								this._deleteCommunity(inputCommunity, args);
							}
						},
						_deleteCommunity : function(community, args) {
							if (!(this._checkCommunityObject(community, args)) || !(this._checkCommunityId(community, args))) {
								return;
							}
							var headers = {
								"Content-Type" : "application/atom+xml"
							};
							var _self = this;
							var _id = community._id;
							this._endpoint.xhrDelete({
								serviceUrl : this._constructCommunityUrl(Constants._methodName.deleteCommunity) + "?communityUuid=" + encodeURIComponent(_id),
								headers : headers,
								load : function(data) {
									if (args.load)
										args.load();
									if (args.handle)
										args.handle();
								},
								error : function(error, ioargs) {
									_self._notifyError(error, args);
								}
							});
						},
						/**
						 * Add member to a community
						 * 
						 * @method addMember
						 * @param {String/Object}
						 *            community id of the community or the community object.
						 * @param {Object}
						 *            member member object representing the member of the community
						 * @param {Object}
						 *            [args] Argument object
						 * @param {Function}
						 *            [args.load]
						 * @param {Function}
						 *            [args.error]
						 * @param {Function}
						 *            [args.handle]
						 */
						addMember : function(inputCommunity, inputMember, args) {
							var community = null;
							var member = inputMember;
							if (!(typeof inputCommunity == "object")) {
								community = new Community(this, inputCommunity);
							} else {
								community = inputCommunity;
							}
							if (!(this._checkCommunityObject(community, args)) || !(this._checkCommunityId(community, args))) {
								return;
							}
							if (!(this._checkMemberObject(member, args)) || !(this._checkMemberId(member, args))) {
								return;
							}
							var _self = this;
							var communityId = community._id;
							var headers = {
								"Content-Type" : "application/atom+xml"
							};
							this._endpoint
									.xhrPost({
										serviceUrl : this._constructCommunityUrl(Constants._methodName.addMember) + "?communityUuid="
												+ encodeURIComponent(communityId),
										postData : this._constructAddMemberRequestBody(member),
										headers : headers,
										load : function(data) {
											var _args = lang.mixin({
												"community" : community
											}, args);
											_self._loadMember(inputMember, _args);
										},
										error : function(error) {
											_self._notifyError(error, args);
										}
									});
						},
						/**
						 * Remove member of a community
						 * 
						 * @method removeMember
						 * @param {String/Object}
						 *            community id of the community or the community object.
						 * @param {String/Object}
						 *            member id of the member or member object
						 * @param {Object}
						 *            [args] Argument object
						 * @param {Function}
						 *            [args.load]
						 * @param {Function}
						 *            [args.error]
						 * @param {Function}
						 *            [args.handle]
						 */
						removeMember : function(inputCommunity, inputMember, args) {
							var community = null;
							var member = null;
							if (!(typeof inputCommunity == "object")) {
								community = new Community(this, inputCommunity);
							} else {
								community = inputCommunity;
							}
							if (!(typeof inputMember == "object")) {
								member = new Member(this, inputMember);
							} else {
								member = inputMember;
							}
							if (!(this._checkCommunityObject(community, args)) || !(this._checkCommunityId(community, args))) {
								return;
							}
							if (!(this._checkMemberObject(member, args)) || !(this._checkMemberId(member, args))) {
								return;
							}
							var _self = this;
							var headers = {
								"Content-Type" : "application/atom+xml"
							};
							var _param = _self._isEmail(member._id) ? "&email=" : "&userid=";
							this._endpoint.xhrDelete({
								serviceUrl : this._constructCommunityUrl(Constants._methodName.removeMember) + "?communityUuid="
										+ encodeURIComponent(community._id) + _param + encodeURIComponent(member._id),
								headers : headers,
								load : function(data) {
									if (args.load)
										args.load();
									if (args.handle)
										args.handle();
								},
								error : function(error) {
									_self._notifyError(error, args);
								}
							});
						},
						/**
						 * Get public communities from IBM Connections
						 * 
						 * @method getPublicCommunities
						 * @param {Object}
						 *            [args] Argument object
						 * @param {Function}
						 *            [args.load]
						 * @param {Function}
						 *            [args.error]
						 * @param {Function}
						 *            [args.handle]
						 * @param {Object}
						 *            [args.parameters] Object representing various parameters that can be passed to get a feed of public communities. The
						 *            parameters must be exactly as they are supported by IBM Connections like ps, sortBy etc.
						 */
						getPublicCommunities : function(args) {
							this._getEntities(args, {
								communityServiceEntity : "communities",
								communitiesType : "public",
								xpath : Constants._xpath_communities_Feed
							});
						},

						/**
						 * Get my communities from IBM Connections
						 * 
						 * @method getMyCommunities
						 * @param {Object}
						 *            [args] Argument object
						 * @param {Function}
						 *            [args.load]
						 * @param {Function}
						 *            [args.error]
						 * @param {Function}
						 *            [args.handle]
						 * @param {Object}
						 *            [args.parameters] Object representing various parameters that can be passed to get a feed of my communities. The
						 *            parameters must be exactly as they are supported by IBM Connections like ps, sortBy etc.
						 */

						getMyCommunities : function(args) {
							this._getEntities(args, {
								communityServiceEntity : "communities",
								communitiesType : "my",
								xpath : Constants._xpath_communities_Feed
							});
						},
						/**
						 * Get members of a community.
						 * 
						 * @method getMembers
						 * @param {Object}
						 *            [args] Argument object
						 * @param {Function}
						 *            [args.load]
						 * @param {Function}
						 *            [args.error]
						 * @param {Function}
						 *            [args.handle]
						 * @param {Object}
						 *            [args.parameters] Object representing various parameters that can be passed to get a feed of members of a community. The
						 *            parameters must be exactly as they are supported by IBM Connections like ps, sortBy etc.
						 */
						getMembers : function(communityArg, args) {
							if (!(typeof communityArg == "object")) {
								var community = new Community(this, communityArg);
								this._getEntities(args, {
									community : community,
									communityServiceEntity : "community",
									communitiesType : "members",
									xpath : Constants._xpath_community_Members_Feed
								});
							} else {
								this._getEntities(args, {
									community : communityArg,
									communityServiceEntity : "community",
									communitiesType : "members",
									xpath : Constants._xpath_community_Members_Feed
								});
							}

						},
						_constructServiceUrl : function(getArgs) {
							var authType = "";
							if (this._endpoint.authType == "basic") {
								authType = "";
							} else if (this._endpoint.authType == "oauth") {
								authType = "/oauth";
							} else {
								authType = "";
							}
							return con.communitiesUrls["communitiesServiceBaseUrl"] + authType
									+ Constants.communityServiceEntity[getArgs.communityServiceEntity] + Constants.communitiesType[getArgs.communitiesType];
						},
						_constructQueryObj : function(args, getArgs) {
							var params = args.parameters;
							if (getArgs.communitiesType == "members") {
								params = lang.mixin(params, {
									"communityUuid" : getArgs.community._id
								});
							}
							return params;
						},
						_getEntities : function(args, getArgs) {
							var _self = this;
							var headers = {
								"Content-Type" : "application/atom+xml"
							};
							this._endpoint.xhrGet({
								serviceUrl : this._constructServiceUrl(getArgs),
								headers : headers,
								content : this._constructQueryObj(args, getArgs),
								load : function(data) {
									var entities = [];
									var entry = xpath.selectNodes(xml.parse(data), getArgs.xpath.entry, con.namespaces);									
									for(var count = 0; count < entry.length; count ++){	
										var node = entry[count];
										if (getArgs.communityServiceEntity == "communities") {
											var community = new Community(this, xpath.selectText(node, getArgs.xpath.id, con.namespaces));
											community.data = node;
											entities.push(community);
										} else if (getArgs.communityServiceEntity == "community" && getArgs.communitiesType == "members") {
											var member = new Member(this, xpath.selectText(node, getArgs.xpath.id, con.namespaces));
											member.data = node;
											entities.push(member);
										}
									}
									if (args.load)
										args.load(entities);
									if (args.handle)
										args.handle(entities);
								},
								error : function(error) {
									_self._notifyError(error, args);
								}
							});
						},
						_isEmail : function(id) {
							return id && id.indexOf('@') >= 0;
						},
						_getUniqueElements: function(arr){
							var _arr = [];
							for(var count = 0; count < arr.length; count ++){
								if(count == arr.indexOf(arr[count])){
									_arr.push(arr[count]);
								}
							}
							return _arr;
						},
						_checkCommunityObject : function(community, args) {
							if (community.declaredClass != "sbt.connections.Community") {
								if (args) {
									this._notifyError({
										code : Constants.sbtErrorCodes.badRequest,
										message : Constants.sbtErrorMessages.args_community
									}, args);
								} else {
									util.log(Constants.sbtErrorMessages.args_community);
								}
								return false;
							} else {
								return true;
							}
						},
						_checkMemberObject : function(community, args) {
							if (community.declaredClass != "sbt.connections.Member") {
								if (args) {
									this._notifyError({
										code : Constants.sbtErrorCodes.badRequest,
										message : Constants.sbtErrorMessages.args_member
									}, args);
								} else {
									util.log(Constants.sbtErrorMessages.args_member);
								}
								return false;
							} else {
								return true;
							}
						},
						_checkCommunityPresence : function(obj, args){
							if (!(obj.community)) {
								this._notifyError({
									code : Constants.sbtErrorCodes.badRequest,
									message : Constants.sbtErrorMessages.null_community
								}, args);
								return false;
							} else {
								return true;
							}
						},
						_checkCommunityId : function(community, args) {
							if (!(community._id)) {
								this._notifyError({
									code : Constants.sbtErrorCodes.badRequest,
									message : Constants.sbtErrorMessages.null_communityId
								}, args);
								return false;
							} else {
								return true;
							}
						},
						_checkMemberId : function(member, args) {
							if (!(member._id)) {
								this._notifyError({
									code : Constants.sbtErrorCodes.badRequest,
									message : Constants.sbtErrorMessages.null_memberId
								}, args);
								return false;
							} else {
								return true;
							}
						}

					});
			return CommunityService;
		});