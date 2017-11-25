import React from 'react';
import PropTypes from 'prop-types';

const zeroPosition = (position) => {
	return position - 136;
}

class PhoneOption extends React.Component {

	render() {
		const { position } = this.props;

		const zeroedPosition = zeroPosition(position);

		const wrapperStyles = {
			transform: 'rotate(' + zeroedPosition + 'deg)'
		};
		
		const optionStyles = {
			transform: 'rotate(' + (-zeroedPosition) + 'deg)'
		};

		return (
			<div className="option-wrapper" style={wrapperStyles}>
				<div className="option" style={optionStyles}>
					Hi
				</div>
			</div>
		)
	}
}

PhoneOption.PropTypes = {
	position: PropTypes.number.isRequired
}


export class PhoneSelector extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			prevOffset: 0,
			offset: 0,
			downAngle: 0,
			currentAngle: 0,
			mouseDown: false,
		};
	}

	render() {
		const {
			onSelect
		} = this.props;

		const {
			offset
		} = this.state;

		// console.log("Offset", offset);

		const optionComponents = []; 
		for (let i = 1; i <= 9; i++) {
			optionComponents.push(
				<PhoneOption key={"option" + i} position={offset + (36 * i)} />,
			)
		}

		return (
			<div 
				className="phone-box"
				ref={(box) => { this.phoneBox = box; }}
					onMouseDown={this.onMouseDown.bind(this)}
					onMouseMove={this.onMouseMove.bind(this)}
					onMouseUp={this.onMouseUp.bind(this)}
			>
				<div 
					className="phone-ring"
				>
					<div className="phone-ring-inner"></div>
					{optionComponents}
				</div>
			</div>
		)
	}

	onMouseDown(evt) {
		const clickX = evt.clientX;
		const clickY = evt.clientY;
		const refX = this.phoneBox.getBoundingClientRect().left;
		const refY = this.phoneBox.getBoundingClientRect().top;
		const relativeX = (clickX - refX) - 300;
		const relativeY = -((clickY - refY) - 300);
		const theta = Math.atan2(relativeY, relativeX) * (180 / Math.PI) + 180;
		// console.log(theta);
		this.setState({
			mouseDown: true,
			downAngle: theta,
		});
	}

	onMouseMove(evt) {
		if (this.state.mouseDown) {
			const clickX = evt.clientX;
			const clickY = evt.clientY;
			const refX = this.phoneBox.getBoundingClientRect().left;
			const refY = this.phoneBox.getBoundingClientRect().top;
			const relativeX = (clickX - refX) - 300;
			const relativeY = -((clickY - refY) - 300);
			const theta = Math.atan2(relativeY, relativeX) * (180 / Math.PI) + 180;
			// console.log(theta);
			const diff = (this.state.downAngle - theta) % 360;
			// console.log("diff", diff, "down", this.state.downAngle, "now", theta);

			this.setState({
				currentAngle: theta,
				offset: this.state.prevOffset + diff,
			});
		}
	}
	
	onMouseUp(evt) {
		this.setState({
			mouseDown: false,
			prevOffset: this.state.offset,
		});
	}
}

PhoneSelector.PropTypes = {
	onSelect: PropTypes.func.isRequired
}