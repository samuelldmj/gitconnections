import { createRouter, createWebHistory } from 'vue-router'

const Login = () => import('./views/Login.vue')
const Dashboard = () => import('./views/Dashboard.vue')
const Privacy = () => import('./views/Privacy.vue')

const routes = [
    { path: '/login', component: Login },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/privacy', component: Privacy },
    { path: '/', redirect: '/login' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('githubToken')
    if (to.meta.requiresAuth && !isAuthenticated) next('/login')
    else next()
})

export default router