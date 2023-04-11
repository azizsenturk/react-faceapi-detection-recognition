import * as faceapi from 'face-api.js';

// Video boyutlarının ayarlanması
export const displaySize = { width: 640, height: 440 };

// Yüz tanıma modellerinin yüklenmesi
export const loadModels = async () => {
	const MODEL_URL = '/models';
	await Promise.all([
		faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
		faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
		faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
		faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
		faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
		faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
	]);
};

// Görüntüdeki yüzlerin tespiti
export const detectFaces = async (video, canvas, showFeatures = false) => {
	const detections = await faceapi
		.detectAllFaces(video, new faceapi.SsdMobilenetv1Options()) // İstenilen model kullanılabilir
		// .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()) // İstenilen model kullanılabilir
		.withFaceLandmarks()
		.withFaceExpressions()
		.withFaceDescriptors()
		.withAgeAndGender();

	const resizedDetections = faceapi.resizeResults(detections, displaySize);

	if (showFeatures) {
		canvas.innerHTML = faceapi.createCanvasFromMedia(video);
		faceapi.matchDimensions(canvas, displaySize);
		canvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height);
		faceapi.draw.drawDetections(canvas, resizedDetections);
		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
		faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
		resizedDetections.forEach(detection => {
			const box = detection.detection.box;
			const drawBox = new faceapi.draw.DrawBox(box, {
				label: `${detection.detection._score.toFixed(2)} Age: ${Math.round(detection.age)} Gender: ${
					detection.gender
				}`
			});
			drawBox.draw(canvas);
		});
	}

	return resizedDetections;
};
