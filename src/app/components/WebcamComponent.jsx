import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import CatchImages from './CatchImages';
import { loadModels, detectFaces, displaySize } from '../configs/faceDetection';
import { loadPersons, loadFaceMatcher, recognizeFaces } from '../configs/faceRecognition';

const WebcamComponent = ({ mirrored, showFeatures, catchImages }) => {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);
	const [requirementsLoaded, setRequirementsLoaded] = useState(false);
	const [faceMatcher, setFaceMatcher] = useState(false);
	const [detectionPersonSpec, setDetectionPersonSpec] = useState(false);

	// Sırasıyla face-api için gereken bilgilerin yüklenmesi
	const loadFaceApiRequirements = useCallback(async () => {
		await loadModels()
			.then(() => loadPersons()) //
			.then(resPersonDescriptors => loadFaceMatcher(resPersonDescriptors))
			.then(resFaceMatcher => setFaceMatcher(resFaceMatcher))
			.then(() => setRequirementsLoaded(true))
			.catch(error => console.error(error));
	}, []);

	// Yüz tespit etme ve tanıma işlemi
	const detectFace = useCallback(() => {
		if (webcamRef?.current && canvasRef?.current) {
			const video = webcamRef.current.video;
			const canvas = canvasRef.current;

			detectFaces(video, canvas, showFeatures)
				.then(detections => recognizeFaces(detections, faceMatcher))
				.then(person => setDetectionPersonSpec(person))
				.catch(error => console.error(error));
		}
	}, [faceMatcher, showFeatures]);

	useEffect(() => {
		if (!requirementsLoaded) {
			loadFaceApiRequirements();
		} else {
			setInterval(() => detectFace(), 500); // 500 ms aralıkla tanımlama işleminin yapılması
		}
	}, [requirementsLoaded, loadFaceApiRequirements, detectFace]);

	function emotionAnalyzer(emotions) {
		let newEmotionObject = {};
		if (emotions) {
			// Duygu verilerini en yüksek olasılığa göre sıralama
			const sortedEmotions = Object?.entries(emotions).sort(([, a], [, b]) => b - a);
			newEmotionObject = sortedEmotions?.map(([emotionName, emotionRate]) => ({ emotionName, emotionRate }));
		}
		return newEmotionObject[0];
	}

	return (
		<div>
			<div className="px-8 pt-8 pb-4">
				<div className="relative flex justify-center items-center">
					<Webcam
						mirrored={mirrored}
						audio={false}
						ref={webcamRef}
						screenshotFormat="image/png"
						minScreenshotWidth={displaySize?.width * 3}
						minScreenshotHeight={displaySize?.height * 3}
						videoConstraints={{ ...displaySize, facingMode: 'user' }}
					/>
					<canvas className={`absolute max-w-full ${mirrored && '-scale-x-100'}`} ref={canvasRef} />
				</div>
			</div>
			<div className="text-center">
				{detectionPersonSpec?.type === 'found' ? 'Welcome ' : ''}
				{detectionPersonSpec?.name}
			</div>
			<div className="text-center">
				{detectionPersonSpec?.type === 'found' ? 'You look ' : ''}
				<span className="capitalize">
					{emotionAnalyzer(detectionPersonSpec?.result?.expressions)?.emotionName}
				</span>
			</div>
			{catchImages && (
				<>
					<hr className="my-4" />
					<CatchImages webcamRef={webcamRef} />
				</>
			)}
		</div>
	);
};

export default WebcamComponent;
