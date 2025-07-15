// import { createApp } from 'vue'
// import { createPinia } from 'pinia';
// import App from './App.vue'
// import router from './router'
import './index.css'
// 
// const app = createApp(App)
// app.use(createPinia());
// app.use(router)
// app.mount('#app')



// import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import App from './App.vue'
// import router from './router'
// 
// const app = createApp(App)
// const pinia = createPinia()
// 
// // Order matters! Pinia must be used before router
// app.use(pinia)
// app.use(router)
// 
// app.mount('#app')



import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createMyRouter } from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(createMyRouter())

app.mount('#app')