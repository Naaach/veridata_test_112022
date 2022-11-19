window.addEventListener('load', windowLoadEvent => {
	const store = {
		testimonialsUrl: "https://testimonialapi.toolcarton.com/api",
		testimonials: []
	}

	function getTestimonials() {
		return new Promise((resolve, reject) => {
			fetch(store.testimonialsUrl)
				.then(res => res.json())
				.then(testimonials => {
					if (!testimonials || !Array.isArray(testimonials) || !testimonials.length) reject(null)
					store.testimonials = testimonials
					resolve(testimonials)
				})
		})
	}

	getTestimonials().then(() => console.log(store.testimonials))
})