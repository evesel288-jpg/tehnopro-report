import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ALLOWED = ['title','client_name','manager_id','manager_name','amount','stage_id',
                 'deadline','payment_status','progress','contract_number','contract_date','comment']

const DATE_FIELDS = ['deadline','contract_date']

const sanitize = (payload) => {
  const result = {}
  for (const key of ALLOWED) {
    if (!(key in payload)) continue
    let val = payload[key]
    // пустые строки в датах -> null
    if (DATE_FIELDS.includes(key) && val === '') val = null
    // пустые строки в необязательных полях -> null
    if (val === '') val = null
    result[key] = val
  }
  return result
}

export function useContracts() {
  const [contracts, setContracts] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contracts')
      .select('*, stages(name, color)')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setContracts(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const createContract = async (payload) => {
    const { data, error } = await supabase
      .from('contracts')
      .insert([sanitize(payload)])
      .select('*, stages(name, color)')
      .single()
    if (!error) {
      setContracts(prev => [data, ...prev])
      await supabase.from('stage_history').insert([{
        contract_id: data.id,
        stage_id: data.stage_id,
        comment: 'Создание контракта',
      }])
    }
    return { data, error }
  }

  const updateContract = async (id, payload) => {
    const { data, error } = await supabase
      .from('contracts')
      .update(sanitize(payload))
      .eq('id', id)
      .select('*, stages(name, color)')
      .single()
    if (!error) setContracts(prev => prev.map(c => c.id === id ? data : c))
    return { data, error }
  }

  const deleteContract = async (id) => {
    const { error } = await supabase.from('contracts').delete().eq('id', id)
    if (!error) setContracts(prev => prev.filter(c => c.id !== id))
    return { error }
  }

  const changeStage = async (contractId, stageId, userId, userEmail, comment) => {
    const updateRes = await supabase
      .from('contracts')
      .update({ stage_id: stageId })
      .eq('id', contractId)
      .select('*, stages(name, color)')
      .single()
    await supabase.from('stage_history').insert([{
      contract_id: contractId,
      stage_id:    stageId,
      user_id:     userId,
      user_email:  userEmail,
      comment,
    }])
    if (!updateRes.error) {
      setContracts(prev => prev.map(c => c.id === contractId ? updateRes.data : c))
    }
    return updateRes
  }

  return { contracts, loading, error, refetch: fetch, createContract, updateContract, deleteContract, changeStage }
}
