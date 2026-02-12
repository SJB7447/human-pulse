'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) throw new Error('Forbidden');

    return supabase;
}

export async function banUser(userId: string) {
    try {
        const supabase = await checkAdmin();

        const { error } = await supabase
            .from('profiles')
            .update({ subscription_status: 'banned' })
            .eq('id', userId);

        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFeedback(interactionId: string) {
    try {
        const supabase = await checkAdmin();

        // We'll just remove the opinion text, keeping the interaction stat
        const { error } = await supabase
            .from('interactions')
            .update({ user_opinion: null })
            .eq('id', interactionId);

        if (error) throw error;

        revalidatePath('/admin/feedback');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteArticle(articleId: string) {
    try {
        const supabase = await checkAdmin();
        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', articleId);
        if (error) throw error;
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
