const Joi = require('joi')
const date = Joi.date()

exports.login = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    extension: Joi.number().allow(null).allow("").optional()
})

exports.create = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).message('Only alphanumeric and underscore allowed for username').min(3).max(50).required(),
    password: Joi.string().allow(null).allow("").optional(),
    user_level_id: Joi.number().min(1).required(),
    user_activity_id: Joi.number().allow(null).allow("").optional(),
    department_id: Joi.number().min(1).required(),
    fullname: Joi.string().allow(null).allow("").optional(),
    ticket_cc: Joi.string().allow(null).allow("").optional(),
    firstname: Joi.string().allow(null).allow("").optional(),
    middlename: Joi.string().allow(null).allow("").optional(),
    lastname: Joi.string().allow(null).allow("").optional(),
    nickname: Joi.string().allow(null).allow("").optional(),
    salutation: Joi.string().allow(null).allow("").optional(),
    email: Joi.string().allow(null).allow("").optional(),
    mobile: Joi.string().allow(null).allow("").optional(),
    phone: Joi.string().allow(null).allow("").optional(),
    address: Joi.string().allow(null).allow("").optional(), 
    picture: Joi.string().allow(null).allow("").optional(),
    gender_id: Joi.number().allow(null).allow("").optional(),
    religion_id: Joi.number().allow(null).allow("").optional(),
    expiry_date: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/).message("expiry_date must be a valid datetime format").allow(null).allow("").optional(),
    birth_date: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/).message("birth_date must be a valid datetime format").allow(null).allow("").optional(),
    join_date: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/).message("join_date must be a valid datetime format").allow(null).allow("").optional(),
    current_work_schedule_detail_id: Joi.number().allow(null).allow("").optional(),
    current_unique_id: Joi.string().allow(null).allow("").optional(),
    current_call_id: Joi.number().allow(null).allow("").optional(),
    verification_code: Joi.string().allow(null).allow("").optional(),
    is_password_request: Joi.number().allow(null).allow("").optional(),
    is_booked: Joi.number().allow(null).allow("").optional(),
    is_active: Joi.number().allow(null).allow("").optional(),
    is_delete: Joi.number().allow(null).allow("").optional(),
    last_activity_time: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("last_activity_time must be a valid datetime format").allow(null).allow("").optional(),
    register_time: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("register_time must be a valid datetime format").allow(null).allow("").optional(),
    last_event_id: Joi.number().allow(null).allow("").optional(),
    host_address: Joi.string().allow(null).allow("").optional(),
    ip_address: Joi.string().allow(null).allow("").optional(),
    is_break: Joi.number().allow(null).allow("").optional(),
    first_login: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("first_login must be a valid datetime format").allow(null).allow("").optional(),
    last_logout: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("last_logout must be a valid datetime format").allow(null).allow("").optional(),
    created_at: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("created_at must be a valid datetime format").allow(null).allow("").optional(),
    created_by: Joi.number().allow(null).allow("").optional(),
    updated_at: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("updated_at must be a valid datetime format").allow(null).allow("").optional(),
    updated_by: Joi.number().allow(null).allow("").optional(),
    info: Joi.string().allow(null).allow("").optional(),
    app_version: Joi.string().allow(null).allow("").optional(),
    logout_reason_id: Joi.number().allow(null).allow("").optional(),
    is_login: Joi.number().allow(null).allow("").optional(),
    total_incorrect: Joi.number().allow(null).allow("").optional(),
    is_new: Joi.number().allow(null).allow("").optional(),
    signature_name: Joi.string().allow(null).allow("").optional(),
    is_so: Joi.number().allow(null).allow("").optional(),
    is_req_copy: Joi.number().allow(null).allow("").optional(),
    is_req_update: Joi.number().allow(null).allow("").optional()
})

exports.update = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).message('Only alphanumeric and underscore allowed for username').min(3).max(50),
    password: Joi.string().allow(null).allow("").optional(),
    user_level_id: Joi.number().allow(null).allow("").optional(),
    user_activity_id: Joi.number().allow(null).allow("").optional(),
    department_id: Joi.number().allow(null).allow("").optional(),
    fullname: Joi.string().allow(null).allow("").optional(),
    ticket_cc: Joi.string().allow(null).allow("").optional(),
    firstname: Joi.string().allow(null).allow("").optional(),
    middlename: Joi.string().allow(null).allow("").optional(),
    lastname: Joi.string().allow(null).allow("").optional(),
    nickname: Joi.string().allow(null).allow("").optional(),
    salutation: Joi.string().allow(null).allow("").optional(),
    email: Joi.string().allow(null).allow("").optional(),
    mobile: Joi.string().allow(null).allow("").optional(),
    phone: Joi.string().allow(null).allow("").optional(),
    address: Joi.string().allow(null).allow("").optional(), 
    picture: Joi.string().allow(null).allow("").optional(),
    gender_id: Joi.number().allow(null).allow("").optional(),
    religion_id: Joi.number().allow(null).allow("").optional(),
    expiry_date: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/).message("expiry_date must be a valid datetime format").allow(null).allow("").optional(),
    birth_date: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/).message("birth_date must be a valid datetime format").allow(null).allow("").optional(),
    join_date: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/).message("join_date must be a valid datetime format").allow(null).allow("").optional(),
    current_work_schedule_detail_id: Joi.number().allow(null).allow("").optional(),
    current_unique_id: Joi.string().allow(null).allow("").optional(),
    current_call_id: Joi.number().allow(null).allow("").optional(),
    verification_code: Joi.string().allow(null).allow("").optional(),
    is_password_request: Joi.number().allow(null).allow("").optional(),
    is_booked: Joi.number().allow(null).allow("").optional(),
    is_active: Joi.number().allow(null).allow("").optional(),
    is_delete: Joi.number().allow(null).allow("").optional(),
    last_activity_time: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("last_activity_time must be a valid datetime format").allow(null).allow("").optional(),
    register_time: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("register_time must be a valid datetime format").allow(null).allow("").optional(),
    last_event_id: Joi.number().allow(null).allow("").optional(),
    host_address: Joi.string().allow(null).allow("").optional(),
    ip_address: Joi.string().allow(null).allow("").optional(),
    is_break: Joi.number().allow(null).allow("").optional(),
    first_login: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("first_login must be a valid datetime format").allow(null).allow("").optional(),
    last_logout: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("last_logout must be a valid datetime format").allow(null).allow("").optional(),
    created_at: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("created_at must be a valid datetime format").allow(null).allow("").optional(),
    created_by: Joi.number().allow(null).allow("").optional(),
    updated_at: Joi.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message("updated_at must be a valid datetime format").allow(null).allow("").optional(),
    updated_by: Joi.number().allow(null).allow("").optional(),
    info: Joi.string().allow(null).allow("").optional(),
    app_version: Joi.string().allow(null).allow("").optional(),
    logout_reason_id: Joi.number().allow(null).allow("").optional(),
    is_login: Joi.number().allow(null).allow("").optional(),
    total_incorrect: Joi.number().allow(null).allow("").optional(),
    is_new: Joi.number().allow(null).allow("").optional(),
    signature_name: Joi.string().allow(null).allow("").optional(),
    is_so: Joi.number().allow(null).allow("").optional(),
    is_req_copy: Joi.number().allow(null).allow("").optional(),
    is_req_update: Joi.number().allow(null).allow("").optional()
}).unknown(true)

exports.detail = Joi.object().keys({
    id: Joi.number().min(1).required()
})

exports.verificationCode = Joi.object().keys({
    code: Joi.string().min(1).required()
})

exports.userActivity = Joi.object().keys({
    user_activity_id: Joi.number().min(1).required()
})

exports.detailEmail = Joi.object().keys({
    email: Joi.string().email().required()
})

exports.forgotPassword = Joi.object().keys({
    email: Joi.string().email().required(),
    verification_code: Joi.string().required()
})

exports.forgotPasswordChange = Joi.object().keys({
    password: Joi.string().required(),
    password_expiration_date: Joi.string().required().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message('password_expiration_date must be a valid datetime format')
})

exports.changePassword = Joi.object().keys({
    old_password: Joi.string().required(),
    new_password: Joi.string().required(),
    password_expiration_date: Joi.string().required().regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/).message('password_expiration_date must be a valid datetime format')
})