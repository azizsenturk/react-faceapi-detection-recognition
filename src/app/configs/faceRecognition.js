import * as faceapi from 'face-api.js';

// Kişilerin resimlerinin yüklenmesi ve yüz tanıma verilerinin oluşturulması
export const loadPersons = async () => {
	const labels = ['Aziz', 'Selin', 'Kerem'];
	const personDescriptors = await Promise.all(
		labels.map(async label => {
			const descriptions = [];
			for (let i = 1; i <= 4; i++) {
				const image = await faceapi.fetchImage(`/images/${label}/${i}.png`);
				const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
				detections?.descriptor && descriptions.push(detections?.descriptor);
			}
			return new faceapi.LabeledFaceDescriptors(label, descriptions);
		})
	);

	return personDescriptors;
};

// Kişinin resimlere göre yüz eşleyicininin oluşturulması
export const loadFaceMatcher = async personDescriptors => {
	return await new faceapi.FaceMatcher(personDescriptors, 0.6);
};

// Tanınan yüzleri kimliklerine göre eşleştirme
export const recognizeFaces = async (detections, faceMatcher) => {
	let bestMatcherPerson = { type: 'notFound', name: 'Kullanıcı bulunamadı' };

	// Eşleşen kişinin bilgilerini ve face-api.js'ten gelen özellikleri atama
	const results = detections.map(d => {
		return { ...faceMatcher.findBestMatch(d.descriptor), ...d };
	});

	results.forEach((result, i) => {
		// new faceapi.draw.DrawTextField([text], box.bottomLeft).draw(canvas);
		const { _label } = result;
		if (_label === 'unknown') {
			bestMatcherPerson = { type: 'notRecognized', name: 'Sen Kimsin?' };
		} else {
			bestMatcherPerson = { type: 'found', name: _label, result };
		}
	});

	return bestMatcherPerson;
};
