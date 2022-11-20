function prevChecks() {
	let validBrowser = true

	// Comprobar si se puede hacer uso del elemento template
	if (!('content' in document.createElement('template'))) {
		alert("Se requiere un navegador que soporte <template>")
		validBrowser = false
	}

	return validBrowser
}

window.addEventListener('load', windowLoadEvent => {
	if (prevChecks() == false) return;

	const store = {
		testimonialsUrl: "https://testimonialapi.toolcarton.com/api",
		testimonials: [],
		elements: {
			html: document.querySelector('html'),
			mainContainer: document.querySelector('section.main-container'),
			testimonialsTemplate: document.querySelector('template#testimonial'),
		},
		modal: {
			open: false,
			$backdrop: document.querySelector('.backdrop'),
			$openModalBtn: document.querySelector('.add-button')
		}
	}

	window.store = store

	// Obtener los testimonios de la api
	function getTestimonials() {
		return new Promise((resolve, reject) => {
			fetch(store.testimonialsUrl)
				.then(res => res.json())
				.then(testimonials => {
					if (!testimonials || !Array.isArray(testimonials) || !testimonials.length) reject(null)
					store.testimonials = testimonials
					resolve(testimonials)
				})
				.catch(err => {
					console.log(err)
					alert('Error obteniendo los testimonios')
				})
		})
	}

	getTestimonials().then(() => {
		console.log(store.testimonials)
		store.testimonials = store.testimonials.sort((a, b) => b.rating - a.rating)
		store.testimonials.forEach(t => addTestimonialToBody(t))
	})

	// Pintamos los testimonios
	function addTestimonialToBody(testimonial) {
		const clone = store.elements.testimonialsTemplate.content.cloneNode(true);
		const $testimonial = clone.querySelector('div.testimonial')

		// Añadimos el avatar
		const $avatar = $testimonial.querySelector('img.avatar')
		if ($avatar) {
			$avatar.setAttribute('src', testimonial.avatar || '')
			$avatar.setAttribute('alt', testimonial.name || '')
		}

		// Añanimos los titulos
		const $title = $testimonial.querySelector('.header .title-container .title')
		if ($title) $title.innerText = testimonial.name || ''
		const $subtitle = $testimonial.querySelector('.header .title-container .subtitle')
		if ($subtitle) $subtitle.innerText = testimonial.location || ''

		// Añadimos el texto
		const $text = $testimonial.querySelector('.text')
		if ($text) $text.innerText = testimonial.message || ''

		// Añadir el rating
		const $rating = $testimonial.querySelector('.rating .bold')
		if ($rating) $rating.innerText = testimonial.rating || ''

		store.elements.mainContainer.appendChild($testimonial)
	}

	// Modal
	function modalChangeState(state) {
		console.log(state)
		store.modal.open = state
		if (store.modal.open) {
			store.modal.$backdrop.classList.remove('hide')
		} else {
			store.modal.$backdrop.classList.add('hide')
		}
	}

	// listeners
	if (store.modal.$openModalBtn) {
		store.modal.$openModalBtn.addEventListener('click', event => {
			modalChangeState(true)
		}, false)
	}
})