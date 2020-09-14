require 'securerandom'

module Mutations
  class Export < BaseMutation
    argument :id, ID, required: true
    type String

    def resolve(id:)
      token = SecureRandom.uuid
      exportation = Exportation.create(token: token, status: 'waiting')
      ExportJob.perform_later(id, token)
      return token
    end
  end
end