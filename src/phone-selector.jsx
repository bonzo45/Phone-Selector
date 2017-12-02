import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';


const NUM_OPTIONS = 10;
const NUM_SEGMENTS = NUM_OPTIONS + 2;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

const PHONE_SIZE = 600;
const DIAL_SIZE = 500;
const DIAL_INNER_SIZE = 300;
const OPTION_SIZE = 70;
const OPTION_BORDER_SIZE = 5;
const OPTION_SHADOW_SIZE = 5;

const MARKER_THICKNESS = 8;

/**
 * Converts a logical rotation, i.e. 0 degrees is the first item
 * in the selector, to the rotation required in the DOM.
 */
const zeroPosition = (position) => {
	return -position - 180 + SEGMENT_ANGLE;
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
	const relativeX = (clickX - refX) - (PHONE_SIZE / 2);
	const relativeY = -((clickY - refY) - (PHONE_SIZE / 2));
	return ((Math.atan2(relativeY, relativeX) * (180 / Math.PI)) + 360) % 360;
}

const StopMarker = ({position}) => {
	return (
		<div
		 	className={"stop-marker"}
		 	style={
		 		{
		 			width: DIAL_SIZE,
		 			height: MARKER_THICKNESS,
		 			top: (DIAL_SIZE - MARKER_THICKNESS) / 2,
		 			transform: 'rotate(' + zeroPosition(position) + 'deg)',
		 		}
		 	}
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

		const rotationWrapperStyle = {
			width: DIAL_SIZE,
			height: OPTION_SIZE,
			top: (DIAL_SIZE - OPTION_SIZE) / 2,
			transform: 'rotate(' + zeroedPosition + 'deg)',
		};
		
		const innerRotationWrapperStyle = {
			width: OPTION_SIZE,
			height: OPTION_SIZE,
			marginLeft: (((DIAL_SIZE - DIAL_INNER_SIZE) / 2) - OPTION_SIZE) / 2,
			transform: 'rotate(' + (-zeroedPosition) + 'deg)'
		};

		const optionUnselectedWrapperClasses = classNames(
			"option-selection-wrapper"
		 );

		const unselectedWrapperStyle = {
			left: 0,
			top: 0,
			width: OPTION_SIZE,
			height: !selected ? OPTION_SIZE : 0,
		}

		const optionSelectedWrapperClasses = classNames(
			"option-selection-wrapper"
		 );

		const selectedWrapperStyle = {
			left: 0,
			bottom: 0,
			width: OPTION_SIZE,
			height: selected ? OPTION_SIZE : 0,
		}

		const optionUnselectedStyle = {
			width: OPTION_SIZE - 2 * OPTION_BORDER_SIZE - 2 * OPTION_SHADOW_SIZE,
			height: OPTION_SIZE - 2 * OPTION_BORDER_SIZE - 2 * OPTION_SHADOW_SIZE,
			border: OPTION_BORDER_SIZE + "px solid black",
			borderRadius: (OPTION_SIZE - 2 * OPTION_BORDER_SIZE / 2),
			left: OPTION_SHADOW_SIZE,
			top: OPTION_SHADOW_SIZE,
			boxShadow: '0px 0px ' + OPTION_SHADOW_SIZE + 'px #000000',
		}
		
		const optionSelectedStyle = {
			width: OPTION_SIZE - 2 * OPTION_BORDER_SIZE - 2 * OPTION_SHADOW_SIZE,
			height: OPTION_SIZE - 2 * OPTION_BORDER_SIZE - 2 * OPTION_SHADOW_SIZE,
			border: OPTION_BORDER_SIZE + "px solid black",
			borderRadius: (OPTION_SIZE - 2 * OPTION_BORDER_SIZE / 2),
			left: OPTION_SHADOW_SIZE,
			bottom: OPTION_SHADOW_SIZE,
			boxShadow: '0px 0px ' + OPTION_SHADOW_SIZE + 'px #000000',
		}

		return (
			<div className="option-rotation-wrapper" style={rotationWrapperStyle}>
				<div className="option-inner-rotation-wrapper" style={innerRotationWrapperStyle}>
					<div
						className={optionUnselectedWrapperClasses}
						style={unselectedWrapperStyle}
					>
						<div
							className="option"
							style={optionUnselectedStyle}
						>
							{text}
						</div>
					</div>
					<div
						className={optionSelectedWrapperClasses}
						style={selectedWrapperStyle}
					>
						<div
							className="option selected"
							style={optionSelectedStyle}
						>
							{text}
						</div>
					</div>
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
			interactionBlocked: false
		};
	}

	render() {
		const { onSelect } = this.props;
		const {	offset } = this.state;
			
		this.selectedOption = -1;
		const optionComponents = []; 
		for (let i = 0; i < NUM_OPTIONS; i++) {
			const position = (SEGMENT_ANGLE * (i + 2)) - offset;
			const selected = 0 <= position && position < SEGMENT_ANGLE;
			if (selected) {
				this.selectedOption = i;
			}
			optionComponents.push(
				<PhoneOption
					key={"option" + i}
				 	position={position}
				 	text={i + ""}
				 	selected={selected}
			 	/>,
			)
		}
		
		const phoneBoxStyle = {
			width: PHONE_SIZE,
			height: PHONE_SIZE,
		}

		const phoneRingStyle = {
			width: DIAL_SIZE,
			height: DIAL_SIZE,
			borderRadius: DIAL_SIZE / 2,
		}

		const phoneRingClasses = classNames(
			"phone-ring",
			{ glow: this.state.mouseDown }
		);
		
		const phoneRingInnerStyle = {
			width: DIAL_INNER_SIZE,
			height: DIAL_INNER_SIZE,
			borderRadius: DIAL_INNER_SIZE / 2,
			top: (DIAL_SIZE - DIAL_INNER_SIZE) / 2,
			left: (DIAL_SIZE - DIAL_INNER_SIZE) / 2,
		}

		const phoneRingInnerClasses = classNames(
			"phone-ring-inner",
			{ glow: this.state.mouseDown }
		);

		const stopComponents = [];
		const startAngle = (MARKER_THICKNESS / (Math.PI * DIAL_SIZE)) * 360;
		const stopAngle = SEGMENT_ANGLE;
		const stops = (((Math.PI * DIAL_SIZE) * (SEGMENT_ANGLE / 360)) / MARKER_THICKNESS) * 1.1;
		for (let i = 0; i < stops; i++) {
			stopComponents.push(
				<StopMarker
					key={"stop_" + i}
				 	position={startAngle + (stopAngle - startAngle) * i / (stops - 1)}
				/>
			)
		}

		return (
			<div 
				ref={(box) => { this.phoneBox = box; }}
				className="phone-box"
				style={phoneBoxStyle}
				onMouseDown={this.onMouseDown.bind(this)}
				onMouseMove={this.onMouseMove.bind(this)}
				onMouseUp={this.onMouseUp.bind(this)}
			>
				<div
					className={phoneRingClasses}
					style={phoneRingStyle}
				>
					<div
						className={phoneRingInnerClasses}
						style={phoneRingInnerStyle}
					></div>
					{stopComponents}
					{optionComponents}
				</div>
			</div>
		)
	}

	onMouseDown(evt) {
		if (this.state.interactionBlocked) {
			return;
		}

		const theta = angleWithinElement(evt, this.phoneBox);
		this.setState({
			mouseDown: true,
			downAngle: theta,
			savedOffset: this.state.offset,
		});
	}

	onMouseMove(evt) {
		if (this.state.interactionBlocked) {
			return;
		}
		
		if (this.state.mouseDown) {
			const theta = angleWithinElement(evt, this.phoneBox);
			const diff = ((this.state.downAngle - theta) + 360) % 360;

			const prevOffset = this.state.offset;
			const offset = ((this.state.savedOffset + diff) +360) % 360;

			// Don't allow turning the wheel anti-clockwise.
			if (prevOffset < 180 && (360 - SEGMENT_ANGLE) < offset) {
				this.setState({
					offset: 0,
					mouseDown: false,
				});
			}
			else if (prevOffset > 180 && (360 - SEGMENT_ANGLE) < offset) {
				this.setState({
					offset: (360 - SEGMENT_ANGLE),
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
		if (this.state.interactionBlocked) {
			return;
		}

		// Work out which thing is selected?
		if (this.selectedOption !== -1) {
			this.props.onSelect(this.selectedOption);
		}
		
		this.setState({
			mouseDown: false,
			savedOffset: this.state.offset,
		}, this.returnToStart);
	}

	returnToStart() {
		// Stop interaction with the phone.
		this.setState({
			interactionBlocked: true
		}, () => {
			// Save the starting offset.
			const initialOffset = this.state.savedOffset;

			// Save the desired offset.
			const desiredOffset = 0;

			const offsetToTravel = initialOffset - desiredOffset;

			// The time to animate over.
			const startTime = new Date().getTime();
			const duration = (offsetToTravel / (360 - SEGMENT_ANGLE)) * 1000;

			// Every 60th of a second, update the offset until we're there.
			const interval = setInterval(() => {
				const currentTime = new Date().getTime();
				const timeElapsed = currentTime - startTime;
				const fractionComplete = timeElapsed / duration;
				this.setState({
					offset: (1 - Math.min(1, fractionComplete)) * offsetToTravel,
				})
				if (fractionComplete >= 1) {
					this.setState({
						interactionBlocked: false,
					});
					clearInterval(interval);
				}
			}, (1000 / 60));
		});
	}
}

PhoneSelector.PropTypes = {
	onSelect: PropTypes.func.isRequired
}
