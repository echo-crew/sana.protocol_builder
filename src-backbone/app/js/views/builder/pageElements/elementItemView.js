let Helpers = require('utils/helpers');

let DateItemView        = require('./types/dateView');
let EntryItemView       = require('./types/entryView');
let SelectItemView      = require('./types/selectView');
let MultiSelectItemView = require('./types/multiSelectView');
let RadioItemView       = require('./types/radioView');
let PictureItemView     = require('./types/pictureView');
let PluginItemView      = require('./types/pluginView');
let PluginEntryItemView = require('./types/pluginEntryView');


module.exports = Marionette.LayoutView.extend({

    template: require('templates/builder/pageElements/elementItemView'),
    tagName: 'li',
    className: function () {
        return 'element element-type-' + Helpers.sluggify(this.model.get('element_type'));
    },

    regions: {
        'customAnswer': 'div.form-group.custom-answer'
    },

    ui: {
        'concept': 'input.concept',
        'question': 'input.question',
        'required': 'input.required',
        'image': 'input.image',
        'audio': 'input.audio',
    },

    events: {
        'click a.delete': '_onDeleteElement',
        'click a.move-up': '_onMoveElementUp',
        'click a.move-down': '_onMoveElementDown',

        'keyup @ui.concept': '_onFormUpdate',
        'keyup @ui.question': '_onFormUpdate',
        'change @ui.required': '_onFormUpdate',
        'keyup @ui.image': '_onFormUpdate',
        'keyup @ui.audio': '_onFormUpdate',
    },

    onBeforeShow: function() {
        let ChildViewClass = this._getChildViewClass();
        this.showChildView('customAnswer', new ChildViewClass({ model: this.model }));
    },

    _getChildViewClass: function() {
        switch (this.model.get('element_type')) {
            case 'DATE':          return DateItemView;
            case 'ENTRY':         return EntryItemView;
            case 'SELECT':        return SelectItemView;
            case 'MULTI_SELECT':  return MultiSelectItemView;
            case 'RADIO':         return RadioItemView;
            case 'PICTURE':       return PictureItemView;
            case 'PLUGIN':        return PluginItemView;
            case 'ENTRY_PLUGIN':  return PluginEntryItemView;
            default:
                console.error('Unrecognized element_type', item.get('element_type'));
        }
    },

    _onDeleteElement: function(event) {
        event.preventDefault();

        let self = this;
        this.$el.fadeOut('fast', function() {
            self.model.destroy({
                wait: true, // Wait for server response before removing from collection
                success: function() {
                    console.info('Deleted Element', self.model.get('id'));
                },
                error: function(model, response, options) {
                    console.warn('Failed to delete Element', self.model.get('id'), response.responseJSON);
                    self.$el.fadeIn();
                    // TODO show error alert
                },
            });
        });
    },

    _onMoveElementUp: function(event) {
        this.model.collection.moveUp(this.model);
    },

    _onMoveElementDown: function(event) {
        this.model.collection.moveDown(this.model);
    },

    _onFormUpdate: function (event) {
        // Wait until input is finished before saving to server to avoid sending too many requests
        if (this._timerId !== undefined) {
            clearTimeout(this._timerId);
            this._timerId = undefined;
        }

        let self = this;
        this._timerId = setTimeout(function() {
            self._saveToServer();
        }, Config.INPUT_DELAY_BEFORE_SAVE);
    },

    _saveToServer: function() {
        let concept = this.ui.concept.val();
        let question = this.ui.question.val();
        let required = this.ui.required.is(':checked');
        let image = this.ui.image.val();
        let audio = this.ui.audio.val();

        let self = this;
        this.model.save({
            concept: concept,
            question: question,
            required: required,
            image: image,
            audio: audio,
        }, {
            beforeSend: function() {
                console.info('Saving Element', self.model.get('id'));
            },
            success: function() {
                console.info('Saved Element', self.model.get('id'));
            },
            error: function() {
                console.error('Unable to save Element changes', self.model.get('id'));
            },
        });
    },

});