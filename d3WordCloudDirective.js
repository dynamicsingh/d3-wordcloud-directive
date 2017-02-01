(function() {

'use strict';

angular.module('app.directive.word_cloud', [])
    .directive('wordcloud', [
        'd3',
        function (d3) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    width: '@',
                    height: '@',
                    fontFamily: '@',
                    fontSize: '@',
                    colorScheme:'@',
                    words: '=',
                    rotate:'@',
                    onClick: '&',
                    onHover: '&'
                },
                link: function postLink($scope, element, attrs) {
                    var width = 800;
                    var height = 600;
                    var fontFamily = 'Impact';
                    var fontSize = 100;
                    var rotation = 'true';
                    var words;

                    if (angular.isDefined(attrs.width))
                        width = attrs.width;
                    if (angular.isDefined(attrs.height))
                        height = attrs.height;
                    if (angular.isDefined(attrs.rotation))
                        rotation = attrs.rotation;
                    if (angular.isDefined(attrs.fontFamily))
                        fontFamily = attrs.fontFamily;
                    if (angular.isDefined(attrs.fontSize))
                        fontSize = attrs.fontSize * 1 || 0;
                    if (angular.isDefined($scope.words))
                        words = $scope.words;
                    if (angular.isDefined($scope.words) && angular.isArray(words)) {
                        words = $scope.words;
                    } else if (angular.element(element).find('word').length > 0) {
                        var subelements = angular.element(element).find('word');
                        words = [];
                        angular.forEach(subelements, function (word) {
                            words.push(angular.element(word).text.text());
                            angular.element(word.text).remove();
                        });
                    } else if (element.text().length > 0) {
                         // console.log('I AM 2'+JSON.stringify(element));
                        words = element.text().split(',');
                        element.text('');

                    } else {
                        element.text('wordcloud: Please define some words');
                        return;
                    }
                    if (!angular.isNumber(fontSize) || fontSize <= 0) {
                        element.text('wordcloud: font-size attribute not valid. font-size ' + attrs.fontSize + ' -> ' + fontSize);
                        return;
                    }
                    var cloudFactory = function (words) {
                       var fill = d3.scale.prophesee_blue();

                        d3.layout.cloud().size([
                            width,
                            height
                        ]).words(words.map(function (d) {
                            return {
                                text: d.text,
                                size: d.size
                            };
                        })).rotate(function () {
                            if(rotation=='true'){
                                return ~~(Math.random() * 2) * -90;
                            }
                            else if(rotation=='false'){
                                return ~~(Math.random() * 2) * - 0;
                            }
                        }).font(fontFamily).fontSize(function (d) {
                            return d.size;
                        }).on('end', draw).start();
                        function draw(words) {
                            var height_translate = height / 2;
                            var width_translate = width / 2;
                            var rootElement = element[0];
                            d3.select(rootElement).html('');//basically empties the child element and than append to it
                            d3.select(rootElement).append('svg').attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + width_translate + ',' + height_translate + ')').selectAll('text').data(words).enter().append('text').style('font-size', function (d) {
                                return d.size + 'px';
                            }).style('font-family', fontFamily).style('fill', function (d, i) {
                                return fill(i);
                            }).attr('text-anchor', 'middle').attr('transform', function (d) {
                                return 'translate(' + [
                                        d.x,
                                        d.y
                                    ] + ')rotate(' + d.rotate + ')';
                            }).text(function (d) {
                                return d.text;
                            }).on('click', function (d) {
                                $scope.onClick({ element: d });
                            }).on('mouseover', function (d) {
                                $scope.onHover({ element: d });
                            });
                        }
                    };
                    $scope.$watch("words", function(value) {
                        words = $scope.words;
                        if(words!=undefined){
                            cloudFactory(words);
                        }
                    });
                }
            };
        }
    ]);
}).call(this);