const ok = (_data) => {
  return {
    ok: true,
    msg: 'Success',
    data: _data
  }
}

const info = (_msg, _data = null) => {
  return {
    ok: false,
    msg: _msg,
    data: (_data != null) ? _data : []
  }
}

const error = (_msg) => {
  return {
    ok: false,
    msg: _msg,
    data: []
  }
}

export const generalResponse = { ok, info, error }
