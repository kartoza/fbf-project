define([
    'backbone',
    'underscore',
    'jquery',
    'jqueryUi',
    'markdown'
], function (Backbone, _, $, JqueryUi, Markdown) {
    return Backbone.View.extend({
        el: "#intro",
        events: {
            'click .next-intro': 'nextClicked',
            'click .prev-intro': 'prevClicked',
            'click .close-intro': 'hide',
        },
        initialize: function () {
            this.currentIntroIndex = 1;
            this.introContent = this.$el.find('.intro-content');
            this.nextButton = this.$el.find('.next-intro');
            this.prevButton = this.$el.find('.prev-intro');
            this.introOpen = true;
            this.markdown = new Markdown({
                html: true,
                linkify: true,
                typographer: true
            });
            dispatcher.on('intro:hide', this.hide, this);
            this.loadIntro();
        },
        loadIntro: function () {
            const self = this;
            $.ajax({
                url: `/intro/intro_${self.currentIntroIndex}.md`,
                dataType: 'text',
                success: function (data) {
                    self.isNextExist(function (exist) {
                        if (self.currentIntroIndex > 1) {
                            self.prevButton.show();
                        } else {
                            self.prevButton.hide();
                        }
                        if (!exist) {
                            self.nextButton.html('Close');
                            if (self.nextButton.hasClass('next-intro')) {
                                self.nextButton.removeClass('next-intro');
                                self.nextButton.addClass('close-intro');
                            }
                        } else {
                            if (self.nextButton.hasClass('close-intro')) {
                                self.nextButton.html('Next');
                                self.nextButton.removeClass('close-intro');
                                self.nextButton.addClass('next-intro');
                            }
                        }
                        self.introContent.animate({'opacity': 0}, 200, function () {
                            $(this).html(self.markdown.render(data)).animate({'opacity': 1}, 200);
                        });
                    });
                }
            });
        },
        nextClicked: function () {
            this.currentIntroIndex += 1;
            this.loadIntro();
        },
        prevClicked: function () {
            this.currentIntroIndex -= 1;
            this.loadIntro();
        },
        hide: function () {
            if (this.introOpen) {
                this.introOpen = false;
                // Hide the intro window
                const $introWindow = $('.intro');
                $introWindow.hide("slide", {direction: "left"}, 200, function () {
                    dispatcher.trigger('map:show-map');
                });
            }
        },
        isNextExist: function (callback) {
            const self = this;
            let _introIndex = self.currentIntroIndex + 1;
            $.ajax({
                url: `/intro/intro_${_introIndex}.md`,
                type: 'GET',
                dataType: 'text',
                success: function (data) {
                    callback(typeof data.status === 'undefined');
                },
                error: function () {
                    callback(false);
                }
            });
        }
    })
});
