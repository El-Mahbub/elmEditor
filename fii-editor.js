/*
 * FII Editor Plugin
 * Copyright 2017, El-Mahbub
 * Dual licensed under the MIT or GPL Version 3 licenses.
 *
 * This editor designed and created for FII only.
 * FII - Forum Ilmu Islam Inc.
 *
 * Dependencies : jQuery hotkeys.
 * Inspired by:
 * Jquery TE, Bootstrap text editor, tinymce and many more. 
*/
var FII = jQuery.noConflict(), App = {}, Elements;
(function($) {
	FII.fn.Fii_Editor = function (option) {
		Elements = FII.extend({
		toolbar : '',
		editor: '',
		message: '',
		target: '',
		classActive: '',
		hotKeys: {
			'ctrl+a': 'selectAll',
			'ctrl+b': 'bold',
			'ctrl+i': 'italic',
			'ctrl+u': 'underline',
			'ctrl+c': 'copy',
			'ctrl+x': 'cut',
			'ctrl+z': 'undo',
			'ctrl+y': 'redo',
			'crtl+k': 'insertReferences',
			//'ctrl+space': 'insertHorizontalRule',
			'ctrl+d': 'delete',
			'ctrl+shift+o': 'insertOrderedList',
			'ctrl+shift+u': 'insertUnorderedlist',
			'ctrl+shift+l': 'justifyleft',
			'ctrl+shift+r': 'justifyright',
			'ctrl+shift+c': 'justifycenter',
			'ctrl+shift+f': 'justifyfull',
			'ctrl+shift+s': 'saveDraft',
			'ctrl+shift+x esc': 'deleteDraft',
			/*'enter': 'insertParagraph',
			'shift+tab': 'outdent',
			'tab': 'indent'*/
		},
		command: {},
		VERSION: '0.1'
	},option);
		var self = FII(this),saveActive = false;
		Object.keys(Elements).forEach(function(k) {
			App[k] = Elements[k];
		});
		var te = FII('#'+App.editor);
		App.command.init = function () {
			document.getElementById(App.editor).designMode="on";
		};
		App.command.init();
		App.command.bindCommands = function (e,c) {
			if (c.split(':').length > 1) {
				var i = c.split(':')[0], k = c.split(':')[1];
				App.command.execute(i,false,k);
			}
			else {
				switch (c) {
					case 'createLink':
						var url = e.val();
						FII('button[data-target='+c+']').click(function(event) {
							event.preventDefault();
							App.command.execute(c,false,url);
						});
						break;
					case 'insertReferences':
						var wrapperReferences = '<span>كتاب : ,</span><span> جزء : ,</span><span> صحيفة </span><br/>';
						App.command.execute('insertHtml',false,wrapperReferences);
						break;
					case 'insertHtml':
						App.command.execute(c,false,'<div class="panel-reference"><br/></div>');
						break;
					case 'insertImage':
						var url = self.find('input[data-target="'+c+'"]').val();
						App.command.execute(c,false,url);
						break;
					case 'saveDraft':
						saveActive == false ? saveActive = true : saveActive = false;
						saveActive === true ? App.command.saveDraft() : sessionStorage.draft = '';
						saveActive === true ? FII(e).addClass(App.classActive) : FII(e).removeClass(App.classActive);
						break;
					case 'deleteDraft':
						sessionStorage.draft = '';
						saveActive = false;
						App.command.execute('selectAll',false,'');
						App.command.execute('delete',false,'');
						break;
					default:
						document.queryCommandState(c) === true ? FII(e).removeClass(App.classActive) : FII(e).addClass(App.classActive);
						App.command.execute(c,false,'');
						break;
				}
			}
		}
		App.command.eventToolbar = function () {
			FII(App.target+',[data-toggle="dropdown"]').each(function(i, e) {
				FII(this).tooltip({placement:'top',container:'body',html:true,delay:{show:0,hide:100}});
				FII(this).click(function(event) {
					event.preventDefault();
					var commandsToolbar;
					if(typeof FII(this).data().value != 'undefined') {
						commandsToolbar = FII(this).data().value;
						App.command.bindCommands(FII(this),commandsToolbar);
					}
				});
			});
		};
		App.command.eventKeyboards = function (key) {
			FII.each(key,function(i,e) {
				te.keydown(i,function(event) {
					event.preventDefault();
					if (e === 'saveDraft') {
						saveActive == false ? saveActive = true : saveActive = false;
						saveActive === true ? App.command.saveDraft() : sessionStorage.draft = '';
						saveActive === true ? FII(App.target).filter(function(index) {
							return FII(this).data().value == e;
						}).addClass(App.classActive) : FII(App.target).filter(function(index) {
							return FII(this).data().value == e;
						}).removeClass(App.classActive);
					}
					else if (e === 'deleteDraft') {
						sessionStorage.draft = '';
						saveActive = false;
						App.command.execute('selectAll',false,'');
						App.command.execute('delete',false,'');
						FII(App.target).filter(function(index) {
							return FII(this).data().value == e;
						}).removeClass(App.classActive)
					}
					else {
						App.command.execute(e,false,'');
					}
				});
			});
		};
		App.command.saveDraft = function () {
			var msg = FII(App.message);
			te.blur(function(event) {
				event.preventDefault();
				if (te.data('inputed') !== undefined && typeof App.message !== 'undefined') {
					sessionStorage.draft = te.data('inputed');
					sessionStorage.draft.length == 4 ? FII(App.message).html('') : FII(App.message).html('<i style="font-size:10px">Saved</i>');
				}
			}).keyup(function(e) {
				if(typeof App.message !== 'undefined'){
					if (e.which != 13) {
						'undefined' !== typeof sessionStorage.draft ? sessionStorage.draft = '' : null;
						te.data('inputed', FII(this).html());
						FII(App.message).html('');
					}
				}
			});
		};
		App.command.openDraft = function () {
			if (typeof sessionStorage.draft !== 'undefined'){
				te.append(sessionStorage.draft);
			}
		};
		App.command.openDraft();
		App.command.eventKeyboards(App.hotKeys);
		App.command.eventToolbar();
		App.command.execute = function (a='',b=false,c='') {
			try {
				var x = document.queryCommandSupported(a);
				if(x === false) throw 'Your browser is not support for "'+a+'" command.'; else document.execCommand(a,b,c);
			}
			catch(e) {
				console.error(e);
			}
		};
	}
}(jQuery));
