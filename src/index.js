import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SectionList, View, Platform, Dimensions } from 'react-native';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

import AlphabeticScrollBar from './components/AlphabeticScrollBar';
import AlphabeticScrollBarPointer from './components/AlphabeticScrollBarPointer';

export default class AlphaScrollFlatList extends Component {
    constructor (props) {
        super(props);

        this.state = {
            activeLetterViewTop: 0,
            activeLetter: undefined,
            isPortrait: this.isPortrait()
        };

        this.scrollToEnd = this.scrollToEnd.bind(this);
        this.scrollToIndex = this.scrollToIndex.bind(this);
        this.scrollToItem = this.scrollToItem.bind(this);
        this.scrollToOffset = this.scrollToOffset.bind(this);
        this.recordInteraction = this.recordInteraction.bind(this);
        this.flashScrollIndicators = this.flashScrollIndicators.bind(this);
    }

    shouldComponentUpdate (nextProps, nextState) {
        if (this.props.hideSideBar !== nextProps.hideSideBar || this.state.activeLetter !== nextState.activeLetter || this.state.activeLetterViewTop !== nextState.activeLetterViewTop) {
            return true
        }
        if (nextProps.contacts || nextProps.sections) {
            console.log(nextProps.sections)
            return true
        }
        return false
    }

    //Forwarded flat list methods
    scrollToEnd (...params) {
        if (this.list)
            this.list.scrollToEnd(...params);
    }

    scrollToIndex (...params) {
        if (this.list)
            this.list.scrollToIndex(...params);
    }

    scrollToItem (...params) {
        if (this.list)
            this.list.scrollToItem(...params);
    }

    scrollToOffset (...params) {
        if (this.list)
            this.list.scrollToOffset(...params);
    }

    recordInteraction (...params) {
        if (this.list)
            this.list.recordInteraction(...params);
    }

    flashScrollIndicators (...params) {
        if (this.list)
            this.list.flashScrollIndicators(...params);
    }

    //Proper methods
    handleOnScroll (letter, activeLetterViewTop) {
        let index;
        if (!this.state.activeLetter)
            this.props.onScrollStarts();
        
        this.setState({
            activeLetter: letter,
            activeLetterViewTop
        });
        
        if (letter === '#') {
            //it's a number or a symbol, scroll to the top or to the bottom of the list
            const firstIndex = 0;
            const lastIndex = this.props.sections.length - 1;

            index = this.props.reverse ? lastIndex : firstIndex;
        } else {
            //Get index of item with that letter and scroll to the first result on the list
            index = this.props.sections.findIndex(item => item[this.props.scrollKey].charAt(0).localeCompare(letter) === 0);    
        }

        if (index !== -1) {
            this.list.scrollToLocation({
                animated: false,
                sectionIndex: index,
                itemIndex: 0
            })
        }
    }

    handleOnScrollEnds () {
        this.props.onScrollEnds();
        this.setState({
            activeLetter: undefined,
            activeLetterViewTop: 0
        });
    }

    // getItemLayout (data, index) {
    //     const {itemHeight, sectionHeight} = this.props;
        
    //     return {
    //         length: itemHeight, 
    //         offset: itemHeight + sectionHeight * index,
    //         index
    //     };
    // }

    isPortrait () {
        const {width, height} = Dimensions.get('window');

        return width < height;
    }

    handleOnLayout () {
        const isPortrait = this.isPortrait();

        if (isPortrait !== this.state.isPortrait)
            this.setState({
                isPortrait
            });
    }
    
    render() {
        return (
            <View onLayout={this.handleOnLayout.bind(this)}>
                <SectionList 
                    {...this.props}
                    ref={elem => this.list = elem}
                />
                {this.props.hideSideBar ? null : (
                    <AlphabeticScrollBar 
                        isPortrait={this.state.isPortrait} 
                        reverse={this.props.reverse} 
                        activeColor={this.props.activeColor}
                        fontColor={this.props.scrollBarColor}
                        fontSizeMultiplier={this.props.scrollBarFontSizeMultiplier}
                        onScroll={debounce(this.handleOnScroll.bind(this))} 
                        onScrollEnds={debounce(this.handleOnScrollEnds.bind(this))} 
                    />
                )}
                {this.state.activeLetter && !this.props.hideSideBar ? <AlphabeticScrollBarPointer letter={this.state.activeLetter} color={this.props.activeColor} top={this.state.activeLetterViewTop} /> : null} 
            </View>
        );
    }
}

AlphaScrollFlatList.propTypes = {
    hideSideBar: PropTypes.bool,
    scrollKey: PropTypes.string,
    reverse: PropTypes.bool,
    itemHeight: PropTypes.number,
    data: PropTypes.array,
    activeColor: PropTypes.string,
    scrollBarColor: PropTypes.string,
    scrollBarFontSizeMultiplier: PropTypes.number,
    onScrollEnds: PropTypes.func,
    onScrollStarts: PropTypes.func,
};

AlphaScrollFlatList.defaultProps = {
    hideSideBar: false,
    scrollKey: 'name',
    activeColor: '#52bad5',
    reverse: false,
    itemHeight: 20,
    scrollBarFontSizeMultiplier: 1,
    onScrollEnds: () => {},
    onScrollStarts: () => {}
};