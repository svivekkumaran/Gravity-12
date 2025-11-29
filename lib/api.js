// API Service Layer for Database Operations
// This file provides a clean interface between the UI and Supabase database

import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase.js';

// Fallback to localStorage if Supabase is not configured
const useLocalStorage = !isSupabaseConfigured();

// ===================================
// User Operations
// ===================================

export async function getUsers() {
    if (useLocalStorage) {
        return JSON.parse(localStorage.getItem('investmentTrackerUsers') || '[]');
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at');

        if (error) handleSupabaseError(error);
        return data || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function getUserById(id) {
    if (useLocalStorage) {
        const users = JSON.parse(localStorage.getItem('investmentTrackerUsers') || '[]');
        return users.find(u => u.id === id);
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) handleSupabaseError(error);
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export async function createUser(user) {
    if (useLocalStorage) {
        const users = JSON.parse(localStorage.getItem('investmentTrackerUsers') || '[]');
        users.push(user);
        localStorage.setItem('investmentTrackerUsers', JSON.stringify(users));
        return user;
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .insert([user])
            .select()
            .single();

        if (error) handleSupabaseError(error);
        return data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function updateUser(id, updates) {
    if (useLocalStorage) {
        const users = JSON.parse(localStorage.getItem('investmentTrackerUsers') || '[]');
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('investmentTrackerUsers', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) handleSupabaseError(error);
        return data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

// ===================================
// Investment Operations
// ===================================

export async function getInvestments(userId = null) {
    if (useLocalStorage) {
        const allData = JSON.parse(localStorage.getItem('investmentTrackerData') || '{}');
        return userId ? (allData[userId] || []) : allData;
    }

    try {
        let query = supabase
            .from('investments')
            .select(`
                *,
                transactions (*)
            `)
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) handleSupabaseError(error);
        return data || [];
    } catch (error) {
        console.error('Error fetching investments:', error);
        return [];
    }
}

export async function createInvestment(investment) {
    if (useLocalStorage) {
        const allData = JSON.parse(localStorage.getItem('investmentTrackerData') || '{}');
        if (!allData[investment.user_id]) {
            allData[investment.user_id] = [];
        }
        allData[investment.user_id].push(investment);
        localStorage.setItem('investmentTrackerData', JSON.stringify(allData));
        return investment;
    }

    try {
        // Insert investment
        const { data: invData, error: invError } = await supabase
            .from('investments')
            .insert([investment])
            .select()
            .single();

        if (invError) handleSupabaseError(invError);

        // Insert initial transactions if any
        if (investment.transactions && investment.transactions.length > 0) {
            const transactionsWithInvId = investment.transactions.map(t => ({
                ...t,
                investment_id: invData.id
            }));

            const { error: txnError } = await supabase
                .from('transactions')
                .insert(transactionsWithInvId);

            if (txnError) handleSupabaseError(txnError);
        }

        return invData;
    } catch (error) {
        console.error('Error creating investment:', error);
        throw error;
    }
}

export async function updateInvestment(id, updates) {
    if (useLocalStorage) {
        const allData = JSON.parse(localStorage.getItem('investmentTrackerData') || '{}');
        for (const userId in allData) {
            const index = allData[userId].findIndex(inv => inv.id === id);
            if (index !== -1) {
                allData[userId][index] = { ...allData[userId][index], ...updates };
                localStorage.setItem('investmentTrackerData', JSON.stringify(allData));
                return allData[userId][index];
            }
        }
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('investments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) handleSupabaseError(error);
        return data;
    } catch (error) {
        console.error('Error updating investment:', error);
        throw error;
    }
}

export async function deleteInvestment(id) {
    if (useLocalStorage) {
        const allData = JSON.parse(localStorage.getItem('investmentTrackerData') || '{}');
        for (const userId in allData) {
            allData[userId] = allData[userId].filter(inv => inv.id !== id);
        }
        localStorage.setItem('investmentTrackerData', JSON.stringify(allData));
        return true;
    }

    try {
        const { error } = await supabase
            .from('investments')
            .delete()
            .eq('id', id);

        if (error) handleSupabaseError(error);
        return true;
    } catch (error) {
        console.error('Error deleting investment:', error);
        throw error;
    }
}

// ===================================
// Transaction Operations
// ===================================

export async function createTransaction(transaction) {
    if (useLocalStorage) {
        // For localStorage, transactions are embedded in investments
        return transaction;
    }

    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert([transaction])
            .select()
            .single();

        if (error) handleSupabaseError(error);
        return data;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
}

export async function getTransactions(investmentId) {
    if (useLocalStorage) {
        // For localStorage, transactions are embedded in investments
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('investment_id', investmentId)
            .order('date', { ascending: true });

        if (error) handleSupabaseError(error);
        return data || [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}
