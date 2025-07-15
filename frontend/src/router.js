import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

const Login = () => import('./views/Login.vue')
const Dashboard = () => import('./views/Dashboard.vue')
const Privacy = () => import('./views/Privacy.vue')

const routes = [
    { path: '/login', component: Login },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/privacy', component: Privacy },
    { path: '/', redirect: '/login' },
]

export function createMyRouter() {
    const router = createRouter({
        history: createWebHistory(),
        routes,
    })

    router.beforeEach((to, from, next) => {
        const authStore = useAuthStore();
        if (to.meta.requiresAuth && !authStore.isAuthenticated) {
            next('/login');
        } else {
            next();
        }
    });

    return router
}