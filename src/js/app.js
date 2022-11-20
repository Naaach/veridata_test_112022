function prevChecks() {
	let validBrowser = true

	// Comprobar si se puede hacer uso del elemento template
	if (!('content' in document.createElement('template'))) {
		alert("Se requiere un navegador que soporte <template>")
		validBrowser = false
	}

	// Comprobamos si se puede usar la API de fetch
	if (!('fetch' in window)) {
		alert("Se requiere un navegador que soporte fetch API")
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
			$mainContainer: document.querySelector('section.main-container'),
			$testimonialsTemplate: document.querySelector('template#testimonial'),
		},
		modal: {
			open: false,
			$backdrop: document.querySelector('.backdrop'),
			$openModalBtn: document.querySelector('.add-button'),
			$btnCancel: document.querySelector('.backdrop .modal-footer .button.cancel'),
			$btnAdd: document.querySelector('.backdrop .modal-footer .button.add'),
		},
		form: {
			rules: {
				name: [v => !!v, v => v + "" != ""],
				location: [v => !!v, v => v + "" != ""],
				message: [v => !!v, v => v + "" != ""],
				rating: [v => !!v, v => v + "" != "", v => parseFloat(v) >= 0 && parseFloat(v) <= 5]
			},
			fields: ['name', 'location', 'rating', 'message'].reduce((fields, key) => {
				const selector = `#new-testimonial .input-wrapper.${key}`
				fields[key] = {
					$el: document.querySelector(`${selector} [name="user_${key}"]`),
					$hint: document.querySelector(`${selector} .hint`),
					value: null,
				}
				return fields
			}, {})
		}
	}

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
		showTestimonials()
	})

	// Pintamos los testimonios
	function showTestimonials() {
		store.testimonials = store.testimonials.sort((a, b) => b.rating - a.rating)
		store.elements.$mainContainer.innerHTML = ""
		store.testimonials.forEach(t => addTestimonialToBody(t))
	}

	function addTestimonialToBody(testimonial) {
		const clone = store.elements.$testimonialsTemplate.content.cloneNode(true);
		const $testimonial = clone.querySelector('div.testimonial')

		// Añadimos el avatar
		const $avatar = $testimonial.querySelector('img.avatar')
		if ($avatar) {
			if (testimonial.avatar) $avatar.setAttribute('src', testimonial.avatar)
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

		store.elements.$mainContainer.appendChild($testimonial)
	}

	// Modal
	function modalChangeState(state) {
		store.modal.open = state
		if (store.modal.open) {
			store.modal.$backdrop.classList.remove('hide')
		} else {
			store.modal.$backdrop.classList.add('hide')
		}
	}

	// Formulario
	function checkForm() {
		let validForm = true

		Object.keys(store.form.fields).forEach(k => {
			// Recogemos los valores
			store.form.fields[k].value = store.form.fields[k].$el.value

			// paramos los valores por el validador
			const valid = store.form.rules[k].every(r => r(store.form.fields[k].value))
			store.form.fields[k].valid = valid
			if (!store.form.fields[k].valid) {
				validForm = false
				store.form.fields[k].$hint.classList.remove('hide')
			} else {
				store.form.fields[k].$hint.classList.add('hide')
			}
		})

		return validForm
	}
	function clearForm() {
		Object.keys(store.form.fields).forEach(k => {
			// Recogemos los valores
			store.form.fields[k].value = null
			store.form.fields[k].$el.value = ""
			store.form.fields[k].$hint.classList.add('hide')
		})
	}

	// listeners
	if (store.modal.$openModalBtn) {		// Abrir el modal
		store.modal.$openModalBtn.addEventListener('click', event => {
			modalChangeState(true)
		}, false)
	}

	if (store.modal.$btnCancel) { 	// Cerrar el modal
		store.modal.$btnCancel.addEventListener('click', event => {
			modalChangeState(false)
			clearForm()
		}, false)
	}

	if (store.modal.$btnAdd) { 		// Guardar el nuevo testimonio
		store.modal.$btnAdd.addEventListener('click', event => {
			const validForm = checkForm()
			if (validForm) {
				// Generamos el objeto de testimonio
				store.testimonials.push({
					name: store.form.fields.name.value,
					location: store.form.fields.location.value,
					rating: store.form.fields.rating.value,
					message: store.form.fields.message.value,
				})

				showTestimonials()
				modalChangeState(false)
				clearForm()
			}
		}, false)
	}
})