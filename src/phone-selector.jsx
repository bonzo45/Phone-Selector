import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Converts a logical rotation, i.e. 0 degrees is the first item
 * in the selector, to the rotation required in the DOM.
 */
const zeroPosition = (position) => {
	return position - 136;
}

/**
 * Returns the angle between 0 and 360 degrees
 * for a click event within an element.
 * 0   -> middle right
 * 90  -> middle top
 * 180 -> middle left
 * 270 -> middle bottom
 */
const angleWithinElement = (evt, element) => {
	const clickX = evt.clientX;
	const clickY = evt.clientY;
	const boundingRect = element.getBoundingClientRect();
	const refX = boundingRect.left;
	const refY = boundingRect.top;
	const relativeX = (clickX - refX) - 300;
	const relativeY = -((clickY - refY) - 300);
	return ((Math.atan2(relativeY, relativeX) * (180 / Math.PI)) +360) % 360;
}

const StopMarker = ({position}) => {
	return (
		<div
		 	className={"stop-marker"}
		 	style={{transform: 'rotate(' + zeroPosition(position) + 'deg)'}}
	 	>
	 		<div className={"stop-marker-visible"}></div>
	 	</div>
	)
}

class PhoneOption extends React.Component {

	render() {
		const { 
			position,
		 	text,
		 	selected
		} = this.props;

		const zeroedPosition = zeroPosition(position);

		const wrapperStyles = {
			transform: 'rotate(' + zeroedPosition + 'deg)'
		};
		
		const optionStyles = {
			transform: 'rotate(' + (-zeroedPosition) + 'deg)'
		};

		const optionClasses = classNames("option", { selected: selected });

		return (
			<div className="option-wrapper" style={wrapperStyles}>
				<div className={optionClasses} style={optionStyles}>
					{text}
				</div>
			</div>
		)
	}
}

PhoneOption.PropTypes = {
	position: PropTypes.number.isRequired,
	text: PropTypes.string.isRequired,
	selected: PropTypes.bool,
}


export class PhoneSelector extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			savedOffset: 0,
			offset: 0,
			downAngle: 0,
			mouseDown: false,
		};
	}

	render() {
		const { onSelect } = this.props;
		const {	offset } = this.state;
			
		const optionComponents = []; 
		for (let i = 1; i <= 9; i++) {
			const position = (36 * i) - offset;
			const selected = 0 <= position && position < 36;
			optionComponents.push(
				<PhoneOption
					key={"option" + i}
				 	position={position}
				 	text={i + ""}
				 	selected={selected}
			 	/>,
			)
		}

		const outerClasses = classNames(
			"phone-ring",
			{ glow: this.state.mouseDown }
		);

		const innerClasses = classNames(
			"phone-ring-inner",
			{ glow: this.state.mouseDown }
		);

		return (
			<div 
				className="phone-box"
				ref={(box) => { this.phoneBox = box; }}
				onMouseDown={this.onMouseDown.bind(this)}
				onMouseMove={this.onMouseMove.bind(this)}
				onMouseUp={this.onMouseUp.bind(this)}
			>
				<div className={outerClasses}>
					<div className={innerClasses}></div>
					<StopMarker position={36} />
					<StopMarker position={0} />
					{optionComponents}
				</div>
			</div>
		)
	}

	onMouseDown(evt) {
		const theta = angleWithinElement(evt, this.phoneBox);
		this.setState({
			mouseDown: true,
			downAngle: theta,
		});
	}

	onMouseMove(evt) {
		if (this.state.mouseDown) {
			const theta = angleWithinElement(evt, this.phoneBox);
			const diff = ((theta - this.state.downAngle) + 360) % 360;

			const prevOffset = this.state.offset;
			const offset = ((this.state.savedOffset + diff) +360) % 360;

			// Don't allow turning the wheel clockwise.
			if (prevOffset < 180 && 324 < offset) {
				this.setState({
					offset: 0,
					mouseDown: false,
				});
			}
			else if (prevOffset > 180 && 324 < offset) {
				this.setState({
					offset: 324,
					mouseDown: false,
				});
			}
			else {
				this.setState({
					offset: offset
				});
			}
		}
	}
	
	onMouseUp(evt) {
		this.setState({
			mouseDown: false,
			savedOffset: this.state.offset,
		});
	}
}

PhoneSelector.PropTypes = {
	onSelect: PropTypes.func.isRequired
}
