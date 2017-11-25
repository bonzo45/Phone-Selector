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
	
	render() {
		const {
			onSelect
		} = this.props;

		const optionComponents = [
			<PhoneOption key={"one"} position={36} />,
			<PhoneOption key={"two"} position={36 * 2} />,
			<PhoneOption key={"three"} position={36 * 3} />,
			<PhoneOption key={"four"} position={36 * 4} />,
		];

		return (
			<div className="phone-box">
				<div className="phone-ring">
					{optionComponents}
				</div>
			</div>
		)
	}
}

PhoneSelector.PropTypes = {
	onSelect: PropTypes.func.isRequired
}