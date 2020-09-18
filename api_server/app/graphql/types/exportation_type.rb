module Types
  class ExportationType < Types::BaseObject
    field :token, String, null: false
    field :status, String, null: false
    field :url, String, null: true
  end
end