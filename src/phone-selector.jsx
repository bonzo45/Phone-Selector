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

		const optionUnselectedWrapperClasses = classNames(
			"option-selection-wrapper",
			 { visible: !selected }
		 );
		const optionSelectedWrapperClasses = classNames(
			"option-selection-wrapper",
			"selected",
			 { visible: selected }
		 );

		return (
			<div className="option-rotation-wrapper" style={wrapperStyles}>
				<div className="option-inner-rotation-wrapper" style={optionStyles}>
					<div className={optionUnselectedWrapperClasses}>
						<div className="option">
							{text}
						</div>
					</div>
					<div className={optionSelectedWrapperClasses}>
						<div className="option selected">
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
					<StopMarker position={36 - (10 / (Math.PI * 500)) * 360} />
					<StopMarker position={0} />
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
		if (this.state.interactionBlocked) {
			return;
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
			const duration = (offsetToTravel / 324) * 1000;

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
			}, 17);
		});
	}
}

PhoneSelector.PropTypes = {
	onSelect: PropTypes.func.isRequired
}
