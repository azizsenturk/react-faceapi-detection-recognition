import React, { useState } from 'react';

const CatchImages = ({ webcamRef }) => {
	const [newImages, setNewImages] = useState([]);
	const capture = () => {
		const imageSrc = webcamRef.current.getScreenshot();
		if (newImages.length < 4) {
			setNewImages(prevImages => [...prevImages, imageSrc]);
		} else {
			setNewImages(prevImages => [...prevImages.slice(1), imageSrc]);
		}
	};

	const download = (image, key) => {
		const link = document.createElement('a');
		link.href = image;
		link.download = `webcam-image${key + 1}.png`;
		document.body.appendChild(link);
		link.click();
	};

	return (
		<div className="max-w-[640px] mx-auto text-center">
			<p className="text-[12px] mb-2">
				If you want the system to recognize you, you need to download the photos and upload the files under the
				public/images folder with the username folder.
			</p>
			<div
				className="px-6 py-1 border border-gray-500 rounded-md hover:bg-gray-500 transition-all cursor-pointer inline-block"
				onClick={capture}
			>
				Take a Photo
			</div>
			<div className="my-4">
				<div className="flex flex-row justify-evenly items-center -mx-3">
					{newImages?.map((item, key) => (
						<div className="w-1/4 px-3 text-center relative" key={key}>
							<img src={item} alt="webcam" />
							<div
								className="absolute top-0 right-3 p-1 m-[2px] rounded-full cursor-pointer bg-[#343541]"
								onClick={() => download(item, key)}
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#8899a4"
									strokeWidth="2"
									strokeLinecap="square"
									strokeLinejoin="arcs"
								>
									<path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"></path>
								</svg>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default CatchImages;
